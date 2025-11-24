import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { getRabbitMQConfig } from '../queue.config';
import { IQueueConsumer } from '../interfaces/consumer.interface';

/**
 * Classe base abstrata para todos os consumers
 * Implementa lógica comum de conexão e gerenciamento de erros
 * Reduz duplicação de código e garante consistência
 */
@Injectable()
export abstract class BaseConsumer implements IQueueConsumer, OnModuleDestroy {
  protected readonly logger: Logger;
  protected connection: amqp.AmqpConnectionManager;
  protected channelWrapper: ChannelWrapper;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly consumerName: string,
  ) {
    this.logger = new Logger(consumerName);
  }

  /**
   * Nome da fila que este consumer irá consumir
   */
  protected abstract getQueueName(): string;

  /**
   * Quantidade de mensagens processadas simultaneamente
   */
  protected abstract getPrefetchCount(): number;

  /**
   * Lógica específica de processamento de mensagem
   * Deve ser implementada por cada consumer
   */
  protected abstract processar(
    conteudo: any,
    routingKey: string,
  ): Promise<void>;

  async inicializar(): Promise<void> {
    await this.conectar();
  }

  private async conectar(): Promise<void> {
    try {
      const config = getRabbitMQConfig(this.configService);

      this.logger.log(`Conectando ao RabbitMQ...`);

      this.connection = amqp.connect([config.url], {
        heartbeatIntervalInSeconds: config.options.heartbeat,
        reconnectTimeInSeconds: 5,
      });

      this.setupConnectionHandlers();

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          await this.setupChannel(channel);
        },
      });

      await this.channelWrapper.waitForConnect();
    } catch (error) {
      this.logger.error('Erro ao conectar:', error);
      throw error;
    }
  }

  private setupConnectionHandlers(): void {
    this.connection.on('connect', () => {
      this.logger.log('Conectado ao RabbitMQ!');
    });

    this.connection.on('disconnect', ({ err }) => {
      this.logger.error('Desconectado do RabbitMQ', err);
    });

    this.connection.on('connectFailed', ({ err }) => {
      this.logger.error('Falha ao conectar no RabbitMQ', err);
    });
  }

  private async setupChannel(channel: ConfirmChannel): Promise<void> {
    const prefetchCount = this.getPrefetchCount();
    const queueName = this.getQueueName();

    await channel.prefetch(prefetchCount);

    await channel.consume(
      queueName,
      (msg) => this.processarMensagem(msg, channel),
      { noAck: false },
    );

    this.logger.log(`Consumindo fila: ${queueName} (prefetch: ${prefetchCount})`);
  }

  async processarMensagem(
    msg: ConsumeMessage | null,
    channel: ConfirmChannel,
  ): Promise<void> {
    if (!msg) {
      this.logger.warn('Mensagem nula recebida');
      return;
    }

    try {
      const conteudo = this.parseMessage(msg);
      const routingKey = msg.fields.routingKey;

      this.logger.debug(`Processando mensagem: ${routingKey}`);

      await this.processar(conteudo, routingKey);

      channel.ack(msg);
      this.logger.debug(`Mensagem processada com sucesso: ${routingKey}`);
    } catch (error) {
      this.handleProcessingError(error, msg, channel);
    }
  }

  private parseMessage(msg: ConsumeMessage): any {
    try {
      return JSON.parse(msg.content.toString());
    } catch (error) {
      this.logger.error('Erro ao parsear mensagem JSON:', error);
      throw new Error('Formato de mensagem inválido');
    }
  }

  private handleProcessingError(
    error: any,
    msg: ConsumeMessage,
    channel: ConfirmChannel,
  ): void {
    this.logger.error('Erro ao processar mensagem:', error);

    // Rejeita mensagem e NÃO recoloca na fila
    // Mensagens com erro vão para DLQ se configurado
    channel.nack(msg, false, false);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Consumer desconectado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao fechar consumer:', error);
    }
  }
}
