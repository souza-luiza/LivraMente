import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../schemas/post.schema';
import { Comunidade, ComunidadeSchema } from '../comunidades/entities/comunidade.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema'
import { Resenha, ResenhaSchema } from './entities/resenha.schema';
import { Livro, LivroSchema } from '../livros/entities/livro.schema';
import { ResenhasService } from './resenhas.service';
import { ResenhasController } from './resenhas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comunidade.name, schema: ComunidadeSchema },
      { name: Resenha.name, schema: ResenhaSchema },
      { name: Livro.name, schema: LivroSchema },
      { name: User.name, schema: UserSchema },
      { name: Comentario.name, schema: ComentarioSchema}
    ]),
  ],
  controllers: [ResenhasController],
  providers: [ResenhasService],
  exports: [ResenhasService],
})
export class ResenhasModule {}