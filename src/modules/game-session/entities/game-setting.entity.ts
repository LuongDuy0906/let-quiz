import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({_id: false})
export class GameSettings{
    @Prop({default: false})
    musicEnable: boolean;

    @Prop({default: false})
    showLeaderBoard: boolean;
}