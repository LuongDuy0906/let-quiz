import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDTO{
    @ApiProperty({description: "Tên người dùng", example: "luongducduy"})
    @IsNotEmpty({message: "Tên người dùng không được để trống"})
    username: string;

    @ApiProperty({description: "Mật khẩu", example: "09062004"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string;
}