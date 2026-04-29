import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateProfileDTO{
    @IsOptional()
    @ApiProperty({description: "Tên người dùng", example: "Lương Đức Duy"})
    username: string;
}