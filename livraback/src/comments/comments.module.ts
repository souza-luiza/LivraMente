import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema';
import { Post, PostSchema } from '../schemas/post.schema';
import { User, UserSchema } from '../users/entities/user.entity';
import { Comunidade, ComunidadeSchema } from '../comunidades/entities/comunidade.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comentario.name, schema: ComentarioSchema },
            { name: Post.name, schema: PostSchema },
            { name: User.name, schema: UserSchema },
            { name: Comunidade.name, schema: ComunidadeSchema}
        ]),
        CloudinaryModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}