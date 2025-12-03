import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedPostsDto {
  @ApiPropertyOptional({ 
    description: 'ID do último post carregado (cursor para rolagem infinita)',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsMongoId()
  cursor?: string;

  @ApiPropertyOptional({ 
    description: 'Quantidade de posts por requisição',
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
