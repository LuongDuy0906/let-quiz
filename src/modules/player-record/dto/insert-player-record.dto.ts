import { IsNotEmpty } from "class-validator";

export class InsertPlayerRecordDto {
    @IsNotEmpty()
    sessionId: string;

    @IsNotEmpty()
    playerId: string;

    @IsNotEmpty()
    playerName: string;

    @IsNotEmpty()
    totalScore: number;

    @IsNotEmpty()
    finalRank: number;

    @IsNotEmpty()
    correctCount: number;

    @IsNotEmpty()
    wrongCount: number;
}