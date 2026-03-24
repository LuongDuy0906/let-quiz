import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, Types } from "mongoose";
import { Question } from "./question.entity";
import { QuizStatus } from "src/enum/quizStatus";
import { QuizTag } from "src/enum/quizTag";

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({
    timestamps: true,
    id: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})
export class Quiz {
    @Prop({type: Types.ObjectId, ref: 'User', required: true, index: true})
    authorId: Types.ObjectId;

    @Prop({required: true})
    title: string;

    @Prop({required: true})
    image: string;

    @Prop({type: [String], enum: QuizTag, required: true})
    tag: QuizTag[];

    @Prop({default: 0})
    rating: number;

    @Prop({default: 0})
    ratingCount: number;

    @Prop({type: [Question], default: []})
    question: Question[];

    @Prop({type: String, enum: QuizStatus, default: QuizStatus.PUBLIC})
    status: QuizStatus;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.virtual('totalQuestions').get(function() {
  return this.question ? this.question.length : 0;
});
