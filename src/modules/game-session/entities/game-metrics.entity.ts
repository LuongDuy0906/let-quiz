import { Prop, Schema } from "@nestjs/mongoose";

@Schema({_id: false})
export class GameMetrics{
    @Prop({default: 0})
    averageScore: number;

    @Prop({default: 0})
    totalPlayer: number;
}