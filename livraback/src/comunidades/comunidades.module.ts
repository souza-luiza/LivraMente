import { Module, forwardRef } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comunidade, ComunidadeSchema } from './entities/comunidade.entity';
import { Post, PostSchema } from '../schemas/post.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Comunidade.name, schema: ComunidadeSchema },
        { name: Post.name, schema: PostSchema },
    ])],
    controllers: [ComunidadesController],
    providers: [ComunidadesService],
    exports: [ComunidadesService]
})
export class ComunidadesModule {}
