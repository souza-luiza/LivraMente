import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PostCategoria } from '../../schemas/post.schema';

export class SearchPostsDto {
  @ApiPropertyOptional({ 
    description: 'Termo de busca para filtrar posts pelo conteúdo ou tags',
    example: 'Harry Potter'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ 
    description: 'Número da página',
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Quantidade de posts por página',
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Filtrar por categoria do post',
    enum: PostCategoria,
    example: PostCategoria.GERAL
  })
  @IsOptional()
  @IsEnum(PostCategoria)
  categoria?: PostCategoria;

  @ApiPropertyOptional({ 
    description: 'Filtrar posts de uma comunidade específica (nome ou ID)',
    example: 'Fantasia'
  })
  @IsOptional()
  @IsString()
  comunidade?: string;

  @ApiPropertyOptional({ 
    description: 'Ordenação dos resultados: recent (mais recentes), popular (mais curtidos)',
    default: 'recent',
    enum: ['recent', 'popular']
  })
  @IsOptional()
  @IsString()
  sort?: 'recent' | 'popular' = 'recent';
}
