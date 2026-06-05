import { IsNotEmpty } from "class-validator";

export class StartGameDTO {
    @IsNotEmpty({message: "Mã PIN không được để trống"})
    roomPin: string

    @IsNotEmpty({message: "ID phiên chơi không được để trống"})
    sessionId: string

}