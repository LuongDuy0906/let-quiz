import { Prop, Schema } from "@nestjs/mongoose";

@Schema({_id: false})
export class Profile{
    @Prop({required: true})
    username: string;

    @Prop()
    avatarUrl: string;

    @Prop({default: 0})
    averageRating: number;
}