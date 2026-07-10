import { ConflictException, Injectable, Ip, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './entities/quiz.entity';
import { Model, Types } from 'mongoose';
import { QuizStatus } from 'src/common/enum/quizStatus';
import { ParamDTO } from './dto/params.dto';
import { UserService } from '../user/user.service';
import { GeminiAIService } from '../gemini/gemini-ai.service';
import { GeminiGenerateDTO } from '../gemini/dto/gemini-generate.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    private readonly userService: UserService,
    private readonly geminiService: GeminiAIService
  ) {}

  async create(userId: string, createQuizDto: CreateQuizDto) {
    return await this.quizModel.create({
      authorId: new Types.ObjectId(userId),
      ...createQuizDto,
    });
  }

  async findAll(input: ParamDTO){
    const {tag, sort = 'createdAt'} = input;
    const filter: any = {status: {$ne: QuizStatus.PRIVATE}};

    if(tag){
      filter.tag = tag;
    }

    const [data, total] = await Promise.all([
      this.quizModel.find(filter).populate('authorId', 'profile.username').select('image title rating isAiGenerated createdAt').sort({[sort]: -1}).limit(5).lean().exec(),
      this.quizModel.countDocuments(filter)
    ]);

    return {
      data: data,
      total: total,
    }
  }                                                           

  async findOne(id: string) {
    const quizInfo = await this.quizModel.findById(id).select('title image questions tag status isAiGenerated').exec();

    return quizInfo;
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
    const existQuiz = await this.quizModel.findById(id).select('rating ratingCount authorId').exec();

    if(!existQuiz){
      throw new NotFoundException("Bộ đề không tồn tại");
    }

    const existRating = existQuiz?.rating || 0;
    let existCount = existQuiz?.ratingCount || 0;

    const newCount = existCount + 1;
    const newRating = Math.round((((existRating * existCount) + rating) / newCount) * 10) / 10;

    const updatedQuiz = await this.quizModel.findByIdAndUpdate(
      id,
      {
        rating: newRating,
        ratingCount: newCount
      },
      {new: true}
    )

    await this.userService.updatedUserRating(existQuiz.authorId.toString());

    return updatedQuiz;
  }

  async getQuestionWithQuizId(id: string, userId: string) {
    const quizData = await this.quizModel
      .findById(id)
      .select('-questions._id -questions.options._id') 

    if(!quizData) {
      throw new NotFoundException('Bộ đề không tồn tại');
    }

    const isUserQuiz: boolean = String(quizData.authorId) === userId;
      
    if(isUserQuiz === false){
      throw new ConflictException('Bạn không có quyền truy cập bộ đề');
    }
    console.log(quizData);

    return quizData;
  }

  async generateQuizQuestionsPreview(data: GeminiGenerateDTO) {
    const rawQuestions = await this.geminiService.generateRawQuestions(data);

    const formattedQuestions = rawQuestions.map((q: any) => ({
      content: q.content,
      questionType: q.questionType || 'single',
      timeLimit: data.timeLimit,
      options: (q.options || []).map((opt: any) => ({
        content: opt.content,
        isCorrect: opt.isCorrect
    }))
  }));

    return {
      title: `Bộ đề AI: ${data.prompt || 'Chưa có tiêu đề'}`,
      description: "Được khởi tạo tự động bởi AI",
      image: "",
      tag: data.tags,
      isAiGenerated: true,
      questions: formattedQuestions,
      status: 'public'
    };
  }
}
