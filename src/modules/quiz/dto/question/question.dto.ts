import { ArrayMaxSize, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from "class-validator";
import { QuestionType } from "src/enum/questionType";
import { OptionDTO } from "../answer/option.dto";
import { Type } from "class-transformer";

export class QuestionDTO{
    @IsNotEmpty({message: "Câu hỏi không được để trống"})
    content: string;

    @IsOptional()
    image?: string;

    @IsNotEmpty({message: "Loại câu hỏi không được để trống"})
    @IsEnum(QuestionType, {message: "Loại câu hỏi không hợp lệ"})
    questionType: QuestionType;

    @IsNotEmpty({message: "Lựa chọn không được để trống"})
    @IsNotEmpty({ message: "Lựa chọn không được để trống" })
    @ArrayMaxSize(4, {message: "Tối đa chỉ được 4 đáp án"})
    @ValidateNested({ each: true })
    @Type(() => OptionDTO)
    option: OptionDTO[];

    @IsNotEmpty({message: "Thời gian không được để trống"})
    @IsNumber({}, {message: "Thời gian phải là số"})
    @Min(30, {message: "Thời gian ít nhất là phải 30 giây"})
    timeLimit: number;

    @IsNotEmpty({message: "Điểm số không được để trống"})
    @IsNumber({}, {message: "Điểm phải là kiểu số"})
    @Min(10, {message: "Điểm số ít nhất phải là 10"})
    point: number;
}