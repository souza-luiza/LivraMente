import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateResenhaDto {
    @ApiProperty({ description: 'Avaliação do Usuário' })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt() // Número inteiro entre 1 e 5
    @Min(1)
    @Max(5)
    avaliacao: number;
    
    @ApiProperty({ description: 'Conteúdo do comentário' })
    @IsOptional()
    @IsString()
    conteudo?: string;

    @ApiProperty({ description: 'Indica se o comentário contém spoiler', default: false })
    @IsOptional()
    @IsBoolean()
    spoiler?: boolean;
}