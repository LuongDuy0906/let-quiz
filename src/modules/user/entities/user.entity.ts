import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
    _id: ObjectId;

    @Prop({required: true, unique: true})
    username: string;

    @Prop({required: true})
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
