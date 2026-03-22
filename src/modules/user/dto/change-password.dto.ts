import { IsNotEmpty } from "class-validator";

export class ChangePasswordDTO{
    @IsNotEmpty({message: "Mật khẩu hiện tại không được để trống"})
    currentPassword: string;

    @IsNotEmpty({message: "Mật khẩu mới không được để trống"})
    newPassword: string;
}