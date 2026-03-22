import { Prop } from "@nestjs/mongoose";

export class Profile{
    @Prop({required: true})
    username: string;

    @Prop()
    avatarUrl: string;
}