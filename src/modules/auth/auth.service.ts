import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';
import { compare } from 'bcrypt';
import { AuthJwtPayload } from 'src/types/jwt-payload';
import { JwtService } from '@nestjs/jwt';

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
    return token;
  }
}
