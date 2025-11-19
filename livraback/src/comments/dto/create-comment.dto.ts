import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ description: 'Conteúdo do comentário' })
    @IsNotEmpty()
    @IsString()
    conteudo: string;

    @ApiProperty({
        description: 'URLs das imagens associadas ao comentário',
        required: false,
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imagens?: string[];
}