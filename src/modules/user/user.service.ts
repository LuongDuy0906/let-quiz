import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { generateCode } from 'src/common/utils/generateCode.utils';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { Quiz, QuizDocument } from '../quiz/entities/quiz.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userModel.findOne({
      email: createUserDto.email
    })

    if(existUser){
      throw new ConflictException("Tên người dùng đã tồn tại")
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    let newUsername: string;
    if(createUserDto.username){
      newUsername = createUserDto.username;
    } else {
      newUsername = 'user_' + generateCode(10);
    }
    return await this.userModel.create(
      {
        email: createUserDto.email,
        password: hashPassword,
        profile: {
          username: newUsername
        }
      }
    );
  }

  async findOne(email: string) {
    return await this.userModel.findOne({
      email: email
    }).select('email password profile role').exec();
  }

  async getMe(id: string){
    const user = await this.userModel.findById(id).select('email profile role').exec();
    if(!user){
      throw new NotFoundException("Không tìm thấy người dùng");
    }
    return user;
  }

  async findLibraryById(id: string, page: number, limit: number){
    const skip = (page - 1) * limit;

    const [quizzes, totalQuizzes] = await Promise.all([
      this.quizModel.find({authorId: id})
        .select('title status question rating ratingCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.quizModel.countDocuments({authorId: id})
    ]);

    return {
      data: quizzes,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalQuizzes / limit),
        totalItems: totalQuizzes
      }
    };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDTO) {
    const existUser = await this.userModel.findById(id);

    if(!existUser){
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return await this.userModel.findByIdAndUpdate(id, 
      {profile: updateProfileDto},
      {returnDocument: 'after', runValidators: true}
    );
  }

    async updateAvatar(userId: string, avatarUrl: string){
      const existQuiz = await this.userModel.findById(userId);
      if(!existQuiz){
        throw new NotFoundException("Bộ đề không tồn tại");
      }
      
      return await this.userModel.findByIdAndUpdate(userId, 
        {
          profile: {
            avatarUrl: avatarUrl
          }
        },
        {
          returnDocument: 'after', runValidators: true
        }
      )
    }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }

  async changePassword(id: string, newPassword: string){
    const existUser = await this.userModel.findById(id).select('password').exec();

    if(!existUser){
      throw new NotFoundException("Không tìm thấy hồ sơ người dùng")
    }

    const newHashPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.findByIdAndUpdate(id, {
      password: newHashPassword,
    })

    return "Cập nhật mật khẩu thành công";
  }

  async updatedUserRating(id: string){
    const user = await this.userModel.findById(id).populate('myQuizzes', "rating ratingCount").lean().exec();
    if(!user){
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    let allRating = 0;
    let allRatingCount = 0;
    const myQuizzes = (user as any).myQuizzes as any[];

    for(const quiz of myQuizzes){
      if(quiz.ratingCount && quiz.ratingCount > 0) {
        allRating += quiz.rating * quiz.ratingCount;
        allRatingCount += quiz.ratingCount;
      }
    }

    const averageUserRating = allRatingCount > 0 ? Math.round((allRating / allRatingCount) * 10) / 10 : 0;
    await this.userModel.findByIdAndUpdate(id, {
      profile: {
        averageRating: averageUserRating,
      }
    });

  }
}
