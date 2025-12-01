import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class AddReadlistsDto {
    @ApiProperty({ description: 'Ids de readlists'})
    @IsNotEmpty()
    @IsArray()
    readlistIds: string[];
}