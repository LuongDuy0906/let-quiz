import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { generateCode } from 'src/common/utils/generateCode.utils';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userModel.findOne({
      email: createUserDto.email
    })

    if(existUser){
      throw new ConflictException("Tên người dùng đã tồn tại")
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    return await this.userModel.create(
      {
        email: createUserDto.email,
        password: hashPassword,
        profile: {
          username: 'user_' + generateCode(10)
        }
      }
    );
  }

  async findAll() {
    return await this.userModel.find().select('email profile -_id').exec();
  }

  async findOne(email: string) {
    return await this.userModel.findOne({
      email: email
    }).select('email password profile role').exec();
  }

  async findById(id: string){
    return await this.userModel.findById(id).populate('myQuizzes', "title status question").select('profile').exec();
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDTO) {
    const existUser = await this.userModel.findById(id);

    if(!existUser){
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const newProfile = {}
    if(updateProfileDto.username){
      newProfile['username'] = updateProfileDto.username
    }

    if(updateProfileDto.image){
      newProfile['avatarUrl'] = updateProfileDto.image
    }

    await this.userModel.findByIdAndUpdate(id, {
      profile: newProfile
    });

    const updatedProfile = await this.userModel.findById(id).select('email profile').exec();

    return updatedProfile;
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }

  async changePassword(id: string, changePasswordDTO: ChangePasswordDTO){
    const existUser = await this.userModel.findById(id).select('password').exec();

    if(!existUser){
      throw new NotFoundException("Không tìm thấy hồ sơ người dùng")
    }

    const isPasswordCorrect = await bcrypt.compareSync(changePasswordDTO.currentPassword, existUser.password);

    if(!isPasswordCorrect){
      throw new ConflictException("Mật khẩu hiện tại không chính xác");
    }

    const newHashPassword = await bcrypt.hash(changePasswordDTO.newPassword, 10);

    await this.userModel.findByIdAndUpdate(id, {
      password: newHashPassword,
    })

    return "Cập nhật mật khẩu thành công";
  }
}
