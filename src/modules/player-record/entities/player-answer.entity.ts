import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({_id: false})
export class PlayerAnswer{
    @Prop({type: Types.ObjectId, required: true})
    questionId: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true})
    answerId: Types.ObjectId;

    @Prop({required: true})
    isCorrect: boolean;

    @Prop({ required: true })
    scoreEarned: number;

    @Prop()
    responseTimeMs: number;
}
