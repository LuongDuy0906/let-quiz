import { IsNotEmpty, IsOptional } from "class-validator";

export class CreatePlayerRecordDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    avatar: string;

    @IsOptional()
    roomPin?: string;

    @IsOptional()
    sessionId?: string;
}
