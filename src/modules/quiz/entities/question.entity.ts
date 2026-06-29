import { Prop, Schema } from "@nestjs/mongoose";
import { QuestionType } from "src/common/enum/questionType";
import { Option } from "./option.entity";

@Schema({ id: false })
export class Question{
    @Prop({required: true})
    content: string;

    @Prop()
    image?: string;

    @Prop({type: String, enum: QuestionType, required: true})
    questionType: QuestionType;

    @Prop({type: [Option], default: []})
    options: Option[];

    @Prop({default: 20})
    timeLimit: number;

    @Prop({default: ''})
    information: string;
}