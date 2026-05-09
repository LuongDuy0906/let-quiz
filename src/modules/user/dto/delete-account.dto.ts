import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class DeleteAccountDTO{
    @ApiProperty({description: "Email của người dùng", example: "user@example.com"})
    @IsEmail({}, {message: "Email không hợp lệ"})
    email: string;

    @ApiProperty({description: "Token xác nhận xóa tài khoản", example: "4bdde66987aa836ea061c555bcba1d3c7ec735fc224e0311bff5f3213db3eb68"})
    @IsNotEmpty({message: "Token không được để trống"})
    token: string;
}
