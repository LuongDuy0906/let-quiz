import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";
import { UserRole } from "src/types/userRole";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
    _id: ObjectId;

    @Prop({required: true, unique: true})
    username: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true, enum: UserRole, default: UserRole.USER})
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
