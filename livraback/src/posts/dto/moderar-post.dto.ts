import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { PostCategoria } from '../../schemas/post.schema';

export class ModerarPostDto {
  @ApiProperty({ 
    description: 'Categoria aprovada para o post', 
    enum: PostCategoria 
  })
  @IsNotEmpty()
  @IsEnum(PostCategoria)
  categoria: PostCategoria;

  @ApiProperty({ 
    description: 'ID do post a ser moderado' 
  })
  @IsNotEmpty()
  @IsMongoId({ message: 'ID do post inválido' })
  postId: string;
}
