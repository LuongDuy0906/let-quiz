import { IsNotEmpty, IsOptional } from "class-validator";

export class CreatePlayerRecordDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    avatar: string;

    @IsNotEmpty()
    roomPin: string;
}
