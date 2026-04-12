import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type GameSessionDocument = HydratedDocument<GameSession>;

@Schema({
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})
export class GameSession{
    @Prop({type: Types.ObjectId, required: true})
    _id: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true})
    quizzId: Types.ObjectId;

    @Prop({required: true})
    pin: number;

    @Prop({required: true, enum: ['COMPLETED', 'ABORTED']})
    status: string;


    @Prop({required: true})
    metrics: {
       totalPlayer: number,
       averageScore: number 
    };
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);

GameSessionSchema.virtual('playerRecord', {
    ref: 'PlayerRecord',
    localField: '_id',
    foreignField: 'sessionId',
    justOne: false
});
