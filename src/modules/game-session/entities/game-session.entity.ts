import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { GameSettings } from "./game-setting.entity";
import { GameMetrics } from "./game-metrics.entity";

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
    quizId: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true})
    hostId: Types.ObjectId

    @Prop({required: true})
    pin: string;
    
    @Prop({type: [GameSettings], default: () => ({})})
    gameSettings: GameSettings

    @Prop({required: true, enum: ['COMPLETED', 'ABORTED', 'LOBBY']})
    status: string;

    @Prop({type: [GameMetrics], required: true})
    metrics: GameMetrics;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);

GameSessionSchema.virtual('playerRecord', {
    ref: 'PlayerRecord',
    localField: '_id',
    foreignField: 'sessionId',
    justOne: false
});
