import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateProfileDTO{
    @IsOptional()
    @ApiProperty({description: "Tên người dùng", example: "Lương Đức Duy"})
    username: string;

    @IsOptional()
    @ApiProperty({ 
        description: 'Ảnh đại diện', 
        type: 'array',
        items: { 
            type: 'string',
            format: 'binary'
        },
    })
    image: string
}