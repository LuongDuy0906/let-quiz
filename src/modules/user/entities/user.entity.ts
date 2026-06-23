import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";
import { UserRole } from "src/common/enum/userRole";
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

    @Prop({type: Profile})
    profile: Profile;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('myQuizzes', {
  ref: Quiz.name,            
  localField: '_id',       
  foreignField: 'authorId' 
});