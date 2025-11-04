import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { PostCategoria } from '../../schemas/post.schema';

export class ModerarPostDto {
  @ApiProperty({ 
    description: 'Aprovar (true) ou rejeitar (false) o post',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  aprovar: boolean;

  @ApiProperty({ 
    description: 'Categoria aprovada para o post', 
    enum: PostCategoria,
    example: PostCategoria.FANART
  })
  @IsNotEmpty()
  @IsEnum(PostCategoria)
  categoria: PostCategoria;
}
