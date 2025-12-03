import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ description: 'Conteúdo do comentário' })
    @IsNotEmpty()
    @IsString()
    conteudo: string;
}