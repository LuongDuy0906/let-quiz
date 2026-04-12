import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ParamDTO{
    @IsOptional()
    @ApiPropertyOptional({description: "Sắp xếp theo", example: "createAt"})
    sort?: string;

    @IsOptional()
    @ApiPropertyOptional({description: "Thể loại", example: "sport"})
    tag?: string;
}