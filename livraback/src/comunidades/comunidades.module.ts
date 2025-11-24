import { Module } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comunidade, ComunidadeSchema } from './entities/comunidade.entity';
import { Post, PostSchema } from '../schemas/post.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Comunidade.name, schema: ComunidadeSchema },
        { name: Post.name, schema: PostSchema },
    ]),
    CloudinaryModule
    ],
    controllers: [ComunidadesController],
    providers: [ComunidadesService]
})
export class ComunidadesModule {}
