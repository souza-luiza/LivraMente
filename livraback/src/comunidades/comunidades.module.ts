import { Module } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comunidade, ComunidadeSchema } from './entities/comunidade.entity';
import { Post, PostSchema } from '../schemas/post.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Comentario, ComentarioSchema } from '../schemas';
import { Livro, LivroSchema } from '../livros/entities/livro.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Comunidade.name, schema: ComunidadeSchema },
        { name: Post.name, schema: PostSchema },
        { name: Comentario.name, schema: ComentarioSchema },
        { name: Livro.name, schema: LivroSchema },
    ]),
    CloudinaryModule
    ],
    controllers: [ComunidadesController],
    providers: [ComunidadesService],
    exports: [MongooseModule]
})
export class ComunidadesModule {}
