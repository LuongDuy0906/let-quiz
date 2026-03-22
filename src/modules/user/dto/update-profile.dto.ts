import { IsOptional } from "class-validator";

export class UpdateProfileDTO{
    @IsOptional()
    username: string;

    @IsOptional()
    avatarUrl: string
}