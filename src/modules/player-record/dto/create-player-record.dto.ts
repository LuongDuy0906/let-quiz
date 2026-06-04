import { IsNotEmpty, IsOptional } from "class-validator";

export class CreatePlayerRecordDto {
    @IsNotEmpty({message: "Tên người chơi không được để trống"})
    name: string;

    @IsOptional()
    avatar: string;

    @IsNotEmpty({message: "Mã PIN không được để trống"})
    roomPin: string;

    @IsOptional()
    userId: string;
}
