import { Module } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comunidade, ComunidadeSchema } from './entities/comunidade.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: Comunidade.name, schema: ComunidadeSchema }])],
    controllers: [ComunidadesController],
    providers: [ComunidadesService]
})
export class ComunidadesModule {}
