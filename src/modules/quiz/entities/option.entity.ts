import { Prop } from "@nestjs/mongoose";

export class Option{
    @Prop({required: true})
    content: string;

    @Prop({required: true})
    isCorrect: boolean;
}