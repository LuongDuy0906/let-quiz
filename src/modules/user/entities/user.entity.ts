import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";
import { UserRole } from "src/enum/userRole";
import { Profile } from "./profile.entity";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
    _id: ObjectId;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true, enum: UserRole, default: UserRole.USER})
    role: UserRole;

    @Prop({type: Profile})
    profile: Profile;

    @Prop()
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
