import { IsNotEmpty } from "class-validator";

export class  OptionDTO{
    @IsNotEmpty({message: "Đáp án không được để trống"})
    content: string;

    @IsNotEmpty({message: "Loại đáp án không được để trống"})
    isCorrect: boolean;
}