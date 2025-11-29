import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchDto {
    @ApiProperty({ description: 'ID do usuário' })
    @IsString({ message: 'A busca deve ser uma string.' })
    @IsNotEmpty({ message: 'A busca não pode estar vazia.' })
    q: string;
}