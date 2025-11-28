import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PostCategoria } from '../../schemas/post.schema';

export class CreatePostDto {
  @ApiProperty({ description: 'Conteúdo da postagem' })
  @IsNotEmpty({ message: 'O conteúdo não pode estar vazio' })
  @IsString()
  @MaxLength(5000, { message: 'O conteúdo não pode ter mais de 5000 caracteres' })
  conteudo: string;

  @ApiProperty({ 
    description: 'ID ou nome da comunidade onde o post será criado' 
  })
  @IsNotEmpty({ message: 'A comunidade é obrigatória' })
  @IsString({ message: 'Comunidade deve ser uma string (ID ou nome)' })
  comunidade: string;

  @ApiProperty({ 
    description: 'Solicitar revisão dos moderadores (para fanart/fanfic)', 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  solicitacao_revisao?: boolean;

  @ApiProperty({ 
    description: 'Categoria do post', 
    enum: PostCategoria,
    default: PostCategoria.GERAL 
  })
  @IsOptional()
  @IsEnum(PostCategoria)
  categoria?: PostCategoria;

  @ApiProperty({ 
    description: 'Tags/tópicos do post', 
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'ID do livro referenciado', 
    required: false 
  })
  @IsOptional()
  @IsMongoId({ message: 'ID do livro inválido' })
  livro_referenciado?: string;

  @ApiProperty({ 
    description: 'Se o post é público', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  publico?: boolean;
}
