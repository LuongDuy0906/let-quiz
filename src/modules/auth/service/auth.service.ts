import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { LoginDTO } from '../dto/login.dto';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { ChangePasswordDTO } from '../../user/dto/change-password.dto';
import * as bcrypt from 'bcrypt'
import { TokenService } from './token.service';
import { RedisTokenService } from './token.redis.service';
import { MailService } from 'src/modules/mail/mail.service';
import { RequestPayload } from '../types/request-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisTokenService,
    private readonly mailService: MailService
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
      access_token: token.accessToken,
      refresh_token: token.refreshToken
    };
  }

  async refreshToken(input: RequestPayload){
    console.log(input._id);
    const existToken = await this.redisService.getRefreshToken(input._id);

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

    await this.redisService.saveRedisToken(input._id, newHashToken, 7);

    return {
      username: input.username,
      new_access_token: newToken.accessToken,
      new_refresh_token: newToken.refreshToken
    }
  }

  async forgotPassword(email: string){
    const resetToken = await this.redisService.creteResetPasswordToken(email);

    try {
      await this.mailService.sendPasswordResetEmail(email, resetToken);
      return "Gửi yêu cầu thành công"
    } catch(e){
      console.log('Lỗi gửi email');
      await this.redisService.deleteToken(`reset_token:${email}`);
      throw new BadRequestException("Không thể gửi thực hiện yêu cầu thay đổi mật khẩu");
    }
  }

  async changePassword(id: string, input: ChangePasswordDTO){
    const isMatch = await this.redisService.validateToken(input.email, input.token);

    if(!isMatch){
      throw new UnauthorizedException("Không thể đổi lại mật khẩu");
    }
    
    await this.userService.changePassword(id, input.newPassword)
    await this.redisService.deleteToken(`reset_token:${input.email}`)
    return "Đổi mật khẩu thành công";
  }

  async logout(id: string){
    await this.redisService.deleteToken(`refresh_token:${id}`);
  }

  async validateGoogleUser(googleUser: CreateUserDto){
    const existUser = await this.userService.findOne(googleUser.email);

    if(existUser) return existUser;
    return await this.userService.create(googleUser);
  }
}
