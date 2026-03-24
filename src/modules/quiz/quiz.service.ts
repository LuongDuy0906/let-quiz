import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './entities/quiz.entity';
import { Model, Types } from 'mongoose';
import { QuizStatus } from 'src/enum/quizStatus';

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

  async findAll() {
    return await this.quizModel.find({status: {$ne: QuizStatus.PRIVATE}}).select('authorId image title question');
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

  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }
}
