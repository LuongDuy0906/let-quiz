import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { PlayerAnswer } from "./player-answer.entity";

export type PlayerRecordDocument = HydratedDocument<PlayerRecord>;

@Schema({timestamps: true})
export class PlayerRecord {
    @Prop({ type: Types.ObjectId, required: true, ref: 'GameSession' })
    sessionId: Types.ObjectId;

    @Prop({ required: true })
    playerId: string;

    @Prop({ required: true })
    playerName: string;

    @Prop({ default: 0 })
    totalScore: number;

    @Prop({ default: 0 })
    finalRank: number;

    @Prop({ default: 0 })
    correctCount: number;

    @Prop({ default: 0 })
    wrongCount: number;

    @Prop({ type: [PlayerAnswer], default: [] })
    responseHistory: PlayerAnswer[];
}

export const PlayerRecordSchema = SchemaFactory.createForClass(PlayerRecord);

