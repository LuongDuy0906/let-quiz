import { IsNotEmpty, IsOptional } from "class-validator";

export class PlayerAnswerDto{
    @IsOptional()
    answerId: string;

    @IsNotEmpty({message: 'Mã câu hỏi không được để trống'})
    questionId: string
}