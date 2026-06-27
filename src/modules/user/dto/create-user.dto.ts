import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateUserDto {
    @ApiProperty({description: "Tên người dùng", example: "duy@gmail.com"})
    @IsNotEmpty({message: "Tên người dùng không được để trống"})
    @IsEmail({}, {message: "Email không đúng định dạng"})
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
        message: 'Email must end with @gmail.com',
    })
    email: string;

    @ApiProperty({description: "Tên người dùng", example: "duy"})
    @IsOptional()
    username?: string;

    @ApiProperty({description: "Mật khẩu", example: "09062004"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string;
}
