import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueProducerService } from './queue.producer.service';
import { NotificacoesConsumer } from './consumers/notificacoes.consumer';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QueueProducerService, NotificacoesConsumer],
  exports: [QueueProducerService],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private readonly queueProducer: QueueProducerService,
    private readonly notificacoesConsumer: NotificacoesConsumer,
  ) {}

  async onModuleInit() {
    await this.queueProducer.connect();
    
    await this.notificacoesConsumer.inicializar();
  }
}
