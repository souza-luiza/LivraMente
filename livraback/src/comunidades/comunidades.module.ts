import { Module } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comunidade, ComunidadeSchema } from './entities/comunidade.entity';
import { Post, PostSchema } from '../schemas/post.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Comentario, ComentarioSchema } from 'src/schemas';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Comunidade.name, schema: ComunidadeSchema },
        { name: Post.name, schema: PostSchema },
        { name: Comentario.name, schema: ComentarioSchema }
    ]),
    CloudinaryModule
    ],
    controllers: [ComunidadesController],
    providers: [ComunidadesService],
    exports: [MongooseModule]
})
export class ComunidadesModule {}
