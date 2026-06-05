import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({_id: false})
export class GameSettings{
    @Prop({default: true})
    showLeaderBoard: boolean;

    @Prop({default: false})
    shuffleQuestions: boolean;

    @Prop({default: false})
    shuffleOptions: boolean
}