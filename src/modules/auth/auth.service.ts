import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/jwt-payload';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
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

    const payload: AuthJwtPayload = {sub: String(existUser._id), username: existUser.username, role: existUser.role}
    const token = await this.jwtService.signAsync(payload)
    return {
      username: existUser.username,
      access_token: token
    };
  }

  async register(input: CreateUserDto){
    const newUser = await this.userService.create(input);

    const payload: AuthJwtPayload = {sub: String(newUser._id), username: newUser.username, role: newUser.role};

    const token = await this.jwtService.signAsync(payload);

    return {
      username: newUser.username,
      access_token: token
    };;
  }
}
