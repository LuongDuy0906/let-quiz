import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDTO{
    @ApiProperty({description: "Tên người dùng", example: "duy@gmail.com"})
    @IsNotEmpty({message: "Tên người dùng không được để trống"})
    @IsEmail({}, {message: "Email không hợp lệ"})
    email: string;

    @ApiProperty({description: "Mật khẩu", example: "09062004"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string;
}