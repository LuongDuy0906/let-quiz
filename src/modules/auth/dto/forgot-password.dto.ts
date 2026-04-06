import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDTO{
    @ApiProperty({description: "email người dùng", example: "duy0906l@gmail.com"})
    @IsNotEmpty({message: 'Email không được để trống'})
    @IsEmail({}, {message: "Email không hợp lệ"})
    email: string;
}