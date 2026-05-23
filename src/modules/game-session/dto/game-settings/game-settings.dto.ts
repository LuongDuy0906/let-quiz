import { IsOptional } from "class-validator";

export class GameSettings{
    @IsOptional()
    musicEnable?: boolean;

    @IsOptional()
    showLeaderBoard?: boolean;
}