import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Option{
    @Prop({required: true})
    content: string;

    @Prop({required: true})
    isCorrect: boolean;
}