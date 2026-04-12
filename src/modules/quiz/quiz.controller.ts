import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/utils/file-upload.utils';
import { ParamDTO } from './dto/params.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({summary: "API tạo bộ đề"})
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createQuizDto: CreateQuizDto, @Req() req) {
    return this.quizService.create(req.user.userId, createQuizDto);
  }

  @Post('/upload')
  @ApiOperation({summary: "API tải ảnh cho bộ đề"})
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Ảnh bộ đề cũng như các câu hỏi',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/quizImage',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File){
    return {
      image: `/uploads/quizImage/${file.filename}`
    }
  }

  @Get()
  @ApiOperation({summary: "API lấy danh sách các bộ đề"})
  findAll(@Query() param: ParamDTO) {
    return this.quizService.findAll(param);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get(':tag')
  findByTag(@Param('tag') tag: string){
    return this.findByTag(tag);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Req() req, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, req.user.userId, updateQuizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.quizService.remove(id, req.user.userId);
  }

  @Patch(':id/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  rating(@Param("id") id: string, @Body() body: {rating: number}){
    return this.quizService.rating(id, body.rating);
  }
}
