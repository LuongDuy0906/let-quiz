import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userModel.findOne({
      username: createUserDto.username
    })

    if(existUser){
      throw new ConflictException("Tên người dùng đã tồn tại")
    }

    createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
    return await this.userModel.create(createUserDto);
  }

  async findAll() {
    return await this.userModel.find().select('username password -_id').exec();
  }

  async findOne(username: string) {
    return await this.userModel.findOne({
      username: username
    }).select('username password -_id').exec();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
