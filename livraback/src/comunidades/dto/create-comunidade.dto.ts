import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class CreateComunidadeDto {
    @ApiProperty({ description: 'Nome da comunidade'} )
    @IsNotEmpty()
    @IsString()
    @Length(2, 30)
    nome: string;

    @ApiProperty({ description: 'Descrição da comunidade'} )
    @IsString()
    @IsOptional()
    descricao?: string;

    @ApiProperty({ description: 'Imagem da comunidade'} )
    @IsOptional()
    @IsUrl()
    imagem_url?: string;

    @ApiProperty({ description: 'Tags/Categorias da comunidade'} )
    @IsOptional() // é opcional
    @IsArray()
    tags?: string[];
}