import { ArrayMaxSize, IsEnum, IsNotEmpty, IsOptional, Validate, ValidateNested } from "class-validator";
import { QuestionDTO } from "./question/question.dto";
import { QuizStatus } from "src/enum/quizStatus";
import { ApiProperty } from "@nestjs/swagger";
import { QuizTag } from "src/enum/quizTag";
import { Type } from "class-transformer";

export class CreateQuizDto {
    @ApiProperty({description: "Tiêu đề của bộ đề", example: "Câu hỏi địa lý"})
    @IsNotEmpty({message: "Tiêu đề không được để trống"})
    title: string;

    @ApiProperty({description: "Ảnh minh họa bộ đề", example: "https://media-blog.jobsgo.vn/blog/wp-content/uploads/2025/08/dia-ly-hoc-la-gi-image-1-1.jpg"})
    @IsOptional()
    image: string;

    @ApiProperty({description: "Các câu hỏi", example: [
        {
            "content": "Làng gốm bát tràng thuộc tỉnh/thành phố nào?",
            "image": "https://ttdn.vn/Uploads/2018/5/5/M%E1%BB%99t%20g%C3%B3c%20s%E1%BA%AFc%20m%C3%A0u%20t%E1%BA%A1i%20B%C3%A1t%20Tr%C3%A0ng.jpg",
            "questionType": "single",
            "option": [
                {
                    "content": "Hà Nội",
                    "isCorrect": true
                },
                {
                    "content": "Bắc Ninh",
                    "isCorrect": false
                }
            ],
            "timeLimit": 30,
            "point": 10
        }
    ]})
    @IsNotEmpty({message: "câu hỏi không được để trống"})
    @ValidateNested({each: true})
    @ArrayMaxSize(30, {message: "Một bộ đề chỉ có tối đa 30 câu hỏi"})
    @Type(() => QuestionDTO)
    question: QuestionDTO[];

    @ApiProperty({description: "Thể loại của bộ đề", example: [
        'Sport',
        'History'
    ]})
    @IsNotEmpty({message: "Loại đề không được để trống"})
    tag: QuizTag[]

    @ApiProperty({description: "Trạng thái bộ đề", example: "public"})
    @IsOptional()
    @IsEnum(QuizStatus, {message: "Trạng thái bộ đề không hợp lệ"})
    status: QuizStatus;
}
