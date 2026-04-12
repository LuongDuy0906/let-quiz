import { Injectable, Ip, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './entities/quiz.entity';
import { Model, Types } from 'mongoose';
import { QuizStatus } from 'src/enum/quizStatus';
import { ParamDTO } from './dto/params.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>
  ) {}

  async create(userId: string, createQuizDto: CreateQuizDto) {
    return await this.quizModel.create({
      authorId: new Types.ObjectId(userId),
      ...createQuizDto
    });
  }

  async findAll(input: ParamDTO){
    const {tag, sort = 'createdAt'} = input;
    const filter: any = {status: {$ne: QuizStatus.PRIVATE}};

    if(tag){
      filter.tag = tag;
    }

    const [data, total] = await Promise.all([
      this.quizModel.find(filter).populate('authorId', 'profile.username').select('image title rating createdAt').sort({[sort]: -1}).limit(5).lean().exec(),
      this.quizModel.countDocuments(filter)
    ]);

    return {
      data: data,
      total: total,
    }
  }                                                           

  async findOne(id: string) {
    return await this.quizModel.findById(id).select('title image question tag status').exec();
  }

  async update(id: string, userId: string, updateQuizDto: UpdateQuizDto) {
    const existQuiz = await this.quizModel.findOne({_id: new Types.ObjectId(id), authorId: new Types.ObjectId(userId)})
    if(!existQuiz){
      throw new NotFoundException("Bộ đề không tồn tại");
    }

    return await this.quizModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: updateQuizDto },
      {returnDocument: 'after', runValidators: true}
    );
  }

  async remove(id: string, userId: string) {
    const existQuiz = await this.quizModel.findOne({_id: new Types.ObjectId(id), authorId: new Types.ObjectId(userId)})
    if(!existQuiz){
      throw new NotFoundException("Bộ đề không tồn tại");
    }

    return await this.quizModel.findByIdAndDelete(id);
  }

  async rating(id: string, rating: number){
    const existQuiz = await this.quizModel.findById(id).select('rating ratingCount').exec();

    const existRating = existQuiz?.rating || 0;
    let existCount = existQuiz?.ratingCount || 0;

    let newRating: number;
    let newCount: number = 0;
    
    newCount += existCount + 1

    newRating = ((existRating * existCount) + rating) / newCount

    return await this.quizModel.findByIdAndUpdate({
      _id: new Types.ObjectId(id),
      rating: newRating,
      ratingCount: newCount
    })
  }
}
