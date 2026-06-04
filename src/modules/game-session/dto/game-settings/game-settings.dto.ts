import { IsOptional } from "class-validator";

export class GameSettings{
    @IsOptional()
    showLeaderBoard?: boolean;

    @IsOptional()
    shuffleQuestion?: boolean;

    @IsOptional()
    shuffleOption?: boolean;
}