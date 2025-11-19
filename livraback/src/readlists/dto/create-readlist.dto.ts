import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReadlistDto {
    @ApiProperty({ description: 'Nome da readlist'} )
    @IsNotEmpty()
    @IsString()
    nome: string;

    @ApiProperty({ description: 'Se a readlist é favorita', default: false })
    @IsOptional()
    @IsBoolean()
    favorito?: boolean;

    @ApiProperty({ description: 'Se a readlist é pública', default: false })
    @IsOptional()
    @IsBoolean()
    publica?: boolean;

    @ApiProperty({ description: 'Descrição da readlist', required: false })
    @IsOptional()
    @IsString()
    descricao?: string;

    @ApiProperty({ description: 'URL da capa da readlist', required: false })
    @IsOptional()
    @IsString()
    capa_url?: string;
}