import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { LoginDTO } from '../dto/login.dto';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { ChangePasswordDTO } from '../../user/dto/change-password.dto';
import * as bcrypt from 'bcrypt'
import { RequestPayload } from '../types/request-payload';
import { TokenService } from './token.service';
import { RedisTokenService } from './redis-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisTokenService
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

    await this.redisService.saveRedisToken(String(existUser._id), hashToken, 7);

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

    await this.redisService.saveRedisToken(String(newUser._id), hashToken, 7);

    return {
      username: newUser.profile.username,
      access_token: token.accessToken,
      refresh_token: token.refreshToken
    };
  }

  async refreshToken(input: RequestPayload){
    const existToken = await this.redisService.getRefreshToken(input.userId);

    if(!existToken){
      throw new NotFoundException("Token không tồn tại");
    }

    if(!input.refreshToken){
      throw new UnauthorizedException("Bạn chưa đăng nhập")
    }

    const isMatch = await bcrypt.compare(input.refreshToken, existToken);

    if(!isMatch){
      throw new UnauthorizedException("Token không hợp lệ");
    }

    const newToken = await this.tokenService.signToken(input);
    const newHashToken = await bcrypt.hash(newToken.refreshToken, 10);

    await this.redisService.saveRedisToken(input.userId, newHashToken, 7);

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
    await this.redisService.deleteToken(id);
  }

  async validateGoogleUser(googleUser: CreateUserDto){
    const existUser = await this.userService.findOne(googleUser.email);

    if(existUser) return existUser;
    return await this.userService.create(googleUser);
  }
}
