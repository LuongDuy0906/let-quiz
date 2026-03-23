import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenService } from './token.service';
import { ChangePasswordDTO } from '../user/dto/change-password.dto';
import * as bcrypt from 'bcrypt'
import { RequestPayload } from './types/request-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService
  ){}

  async login(input: LoginDTO) {
    const existUser = await this.userService.findOne(input.email);

    if(!existUser){
      throw new ConflictException("Tên người dùng không tồn tại");
    }

    const isPassword = await bcrypt.compare(input.password, existUser.password);

    if(!isPassword){
      throw new ConflictException("Mật khẩu không chính xác")
    }

    const token = await this.tokenService.signToken(existUser);
    const hashToken = await bcrypt.hash(token.refreshToken, 10);

    await this.tokenService.updateRefreshToken(String(existUser._id), hashToken);

    return {
      username: existUser.profile.username,
      access_token: token.accessToken,
      refresh_token: token.refreshToken
    };
  }

  async register(input: CreateUserDto){
    const newUser = await this.userService.create(input);

    const token = await this.tokenService.signToken(newUser);
    const hashToken = await bcrypt.hash(token.refreshToken, 10);
    await this.tokenService.updateRefreshToken(String(newUser._id), hashToken);

    return {
      username: newUser.profile.username,
      access_token: token
    };
  }

  async refreshToken(input: RequestPayload){
    const existUser = await this.userService.findById(String(input.userId));

    if(!existUser || !existUser.refreshToken){
      throw new UnauthorizedException("Phiên đăng nhập đã hết hạn")
    }

    const isMatch = await bcrypt.compare(String(input.refreshToken), existUser.refreshToken);

    if(!isMatch){
      throw new UnauthorizedException("Token không hợp lệ")
    }

    const newToken = await this.tokenService.signToken(input);
    const newHashToken = await bcrypt.hash(newToken.refreshToken, 10);

    await this.tokenService.updateRefreshToken(String(existUser._id), newHashToken);
    return {
      username: input.username,
      new_access_token: newToken.accessToken,
      new_refresh_token: newToken.refreshToken
    }
  }

  async changePassword(id: string, input: ChangePasswordDTO){
    return await this.userService.changePassword(id, input);
  }

  async logout(id: string){
    return await this.tokenService.updateRefreshToken(id, null);
  }

  async validateGoogleUser(googleUser: CreateUserDto){
    const existUser = await this.userService.findOne(googleUser.email);

    if(existUser) return existUser;
    return await this.userService.create(googleUser);
  }
}
