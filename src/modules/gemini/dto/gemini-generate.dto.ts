import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { QuizTag } from "src/common/enum/quizTag";

export class GeminiGenerateDTO{
    @IsNotEmpty({message: 'Bạn cần phải nhập yêu cầu của bạn'})
    @ApiProperty({description: 'Prompt', example: 'Câu hỏi chủ đề lịch sử'})
    prompt: string;

    @IsNotEmpty({message: 'Bạn cần phải nhập số lượng câu hỏi muốn khởi tạo'})
    @IsNumber({}, {message: "Số lượng câu hỏi phải là một giá trị số"})
    @ApiProperty({description: 'Số lượng câu hỏi', example: 2})
    questionCount: number;

    @IsNotEmpty({message: 'Bạn cần nhập thời gian của mỗi câu hỏi'})
    @ApiProperty({description: 'Thời gian trả lời', example: 15})
    timeLimit: number;

    @IsArray({message: 'Bạn cần phải lựa chọn thể loại câu hỏi muốn khởi tạo'})
    @ArrayNotEmpty({message: 'Bạn cần phải lựa chọn thể loại câu hỏi muốn khởi tạo'})
    @IsEnum(QuizTag, {each: true, message: 'Thể loại không phù hợp'})
    @ApiProperty({description: 'Tag bộ đề', example: [QuizTag.GEOGRAPHY, QuizTag.HISTORY], isArray: true })
    tags: QuizTag[];
}