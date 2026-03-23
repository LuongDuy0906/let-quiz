import { Prop } from "@nestjs/mongoose";
import { QuestionType } from "src/enum/questionType";
import { Option } from "./option.entity";

export class Question{
    @Prop({required: true})
    content: string;

    @Prop()
    image?: string;

    @Prop({type: String, enum: QuestionType, required: true})
    questionType: QuestionType;

    @Prop({type: [Option], default: []})
    option: Option[];

    @Prop({default: 30})
    timeLimit: number;

    @Prop({default: 10})
    point: number;
}