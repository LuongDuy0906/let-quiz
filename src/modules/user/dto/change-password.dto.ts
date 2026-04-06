import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ChangePasswordDTO{
    @ApiProperty({description: "Email người dùng", example: "duy0906l@gmail.com"})
    @IsNotEmpty({message: "Email không được để trống"})
    @IsEmail({}, {message: "Email không hợp lệ"})
    email: string;

    @ApiProperty({description: "Reset token tương ứng trong mail", example: "4bdde66987aa836ea061c555bcba1d3c7ec735fc224e0311bff5f3213db3eb68"})
    @IsNotEmpty({message: "Token không được để trống"})
    token: string;

    @ApiProperty({description: 'Mật khẩu mới', example: "09062004lol"})
    @IsNotEmpty({message: "Mật khẩu mới không được để trống"})
    newPassword: string;
}