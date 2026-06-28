import { IsOptional } from "class-validator";

export class GameSettings{
    @IsOptional()
    showLeaderboard?: boolean;

    @IsOptional()
    shuffleQuestions?: boolean;

    @IsOptional()
    shuffleOptions?: boolean;
}