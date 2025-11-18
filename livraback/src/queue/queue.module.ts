import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueProducerService } from './queue.producer.service';
import { NotificacoesConsumer } from './consumers/notificacoes.consumer';
import { ImagensConsumer } from './consumers/imagens.consumer';
import { MetricasConsumer } from './consumers/metricas.consumer';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    QueueProducerService,
    NotificacoesConsumer,
    ImagensConsumer,
    MetricasConsumer,
  ],
  exports: [QueueProducerService],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private readonly queueProducer: QueueProducerService,
    private readonly notificacoesConsumer: NotificacoesConsumer,
    private readonly imagensConsumer: ImagensConsumer,
    private readonly metricasConsumer: MetricasConsumer,
  ) {}

  async onModuleInit() {
    await this.queueProducer.connect();
    
    await Promise.all([
      this.notificacoesConsumer.inicializar(),
      this.imagensConsumer.inicializar(),
      this.metricasConsumer.inicializar(),
    ]);
  }
}
