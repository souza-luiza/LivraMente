import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueProducerService } from './queue.producer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QueueProducerService],
  exports: [QueueProducerService],
})
export class QueueModule implements OnModuleInit {
  constructor(private readonly queueProducer: QueueProducerService) {}

  async onModuleInit() {
    await this.queueProducer.connect();
  }
}
