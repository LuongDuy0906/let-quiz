import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateGameSessionDto {
    @IsNotEmpty()
    @ApiProperty({ description: "ID của bộ đề", example: "60c72b2f9b1d4c0015b8e8a1" })
    quizId: string;
}
