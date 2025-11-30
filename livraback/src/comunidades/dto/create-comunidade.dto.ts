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

    @ApiProperty({ description: 'Imagem de capa da comunidade'} )
    @IsOptional()
    @IsUrl()
    capaUrl?: string;

    @ApiProperty({ description: 'Banner da comunidade'} )
    @IsOptional()
    @IsUrl()
    bannerUrl?: string;

    @ApiProperty({ description: 'Tags/Categorias da comunidade'} )
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiProperty({ description: 'Slug da comunidade (para a URL)'} )
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ description: 'ID do livro principal da comunidade'} )
    @IsOptional()
    @IsString()
    livro?: string;
}