import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';
import { compare } from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenService } from './token.service';
import { AuthJwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService
  ){}

  async login(input: LoginDTO) {
    const existUser = await this.userService.findOne(input.username);

    if(!existUser){
      throw new ConflictException("Tên người dùng không tồn tại");
    }

    const isPassword = await compare(input.password, existUser.password);

    if(!isPassword){
      throw new ConflictException("Mật khẩu không chính xác")
    }

    const token = await this.tokenService.signToken(existUser);
    return {
      username: existUser.username,
      access_token: token
    };
  }

  async register(input: CreateUserDto){
    const newUser = await this.userService.create(input);

    const token = await this.tokenService.signToken(newUser);

    return {
      username: newUser.username,
      access_token: token
    };
  }

  async refreshToken(input: AuthJwtPayload){
    const newAccessToken = await this.tokenService.refreshToken(input);

    return {
      username: input.username,
      new_access_token: newAccessToken
    }
  }
}
