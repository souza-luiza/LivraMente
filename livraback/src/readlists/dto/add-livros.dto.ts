import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class AddLivrosDto {
    @ApiProperty({ description: 'Ids de livros'})
    @IsNotEmpty()
    @IsArray()
    livroIds: string[];
}