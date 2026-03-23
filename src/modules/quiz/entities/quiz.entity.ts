import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, Types } from "mongoose";
import { Question } from "./question.entity";
import { QuizStatus } from "src/enum/quizStatus";

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({timestamps: true})
export class Quiz {
    _id: ObjectId;

    @Prop({type: Types.ObjectId, ref: 'User', required: true, index: true})
    authorId: Types.ObjectId;

    @Prop({required: true})
    title: string;

    @Prop()
    image?: string;

    @Prop({type: [Question], default: []})
    question: Question[];

    @Prop({type: String, enum: QuizStatus, default: QuizStatus.PUBLIC})
    status: QuizStatus;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
