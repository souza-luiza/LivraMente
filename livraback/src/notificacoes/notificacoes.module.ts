import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { Notificacao, NotificacaoSchema } from '../schemas/notificacao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notificacao.name, schema: NotificacaoSchema },
    ]),
  ],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService], 
})
export class NotificacoesModule {}
