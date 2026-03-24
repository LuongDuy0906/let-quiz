import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";
import { UserRole } from "src/enum/userRole";
import { Profile } from "./profile.entity";
import { Quiz } from "src/modules/quiz/entities/quiz.entity";

export type UserDocument = HydratedDocument<User>;

@Schema(
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)
export class User {

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

UserSchema.virtual('myQuizzes', {
  ref: Quiz.name,            
  localField: '_id',       
  foreignField: 'authorId' 
});