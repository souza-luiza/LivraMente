import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from '../schemas/post.schema';
import { Comunidade, ComunidadeSchema } from '../comunidades/entities/comunidade.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema' 
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comunidade.name, schema: ComunidadeSchema },
      { name: User.name, schema: UserSchema },
      { name: Comentario.name, schema: ComentarioSchema}
    ]),
    CloudinaryModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
