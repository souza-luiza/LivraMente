import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { getRabbitMQConfig } from './queue.config';
import { EXCHANGES, FILAS, CONFIG_FILA } from './queue.constants';

@Injectable()
export class QueueProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueProducerService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {}

  /*
  Estabelece conexão com RabbitMQ e configura o canal
   */
  async connect(): Promise<void> {
    try {
      const config = getRabbitMQConfig(this.configService);
      
      this.logger.log('Conectando ao RabbitMQ...');
      
      this.connection = amqp.connect([config.url], {
        heartbeatIntervalInSeconds: config.options.heartbeat,
        reconnectTimeInSeconds: 5,
      });

      // canal wrapper
      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          await this.setupExchangesAndQueues(channel);
        },
      });

      await this.channelWrapper.waitForConnect();
      this.logger.log('Conectado ao RabbitMQ com sucesso!');
      
    } catch (error) {
      this.logger.error('Erro ao conectar no RabbitMQ:', error);
      throw error;
    }
  }

  /*
    Configura exchanges e filas
   */
  private async setupExchangesAndQueues(channel: ConfirmChannel): Promise<void> {
    // Cria exchange principal do tipo 'topic' (permite routing keys com padrões)
    await channel.assertExchange(EXCHANGES.EVENTOS_LIVRAMENTE, 'topic', {
      durable: true, // Persiste após restart do RabbitMQ
    });

    // Cria filas
    const filas = Object.values(FILAS);
    for (const nomeFila of filas) {
      await channel.assertQueue(nomeFila, {
        durable: true, 
        arguments: {
          'x-message-ttl': CONFIG_FILA.TTL_MENSAGEM, 
        },
      });
    }

    await this.criarBindings(channel);

  }

  /**
   * Cria bindings automáticos entre exchange e filas
   */
  private async criarBindings(channel: ConfirmChannel): Promise<void> {
    const bindings = [
      { queue: FILAS.ENVIAR_NOTIFICACOES, routingKey: 'notificar.*' },
      { queue: FILAS.ENVIAR_NOTIFICACOES, routingKey: 'notificar.*.criado' },
      { queue: FILAS.ENVIAR_NOTIFICACOES, routingKey: 'notificar.*.curtido' },
      { queue: FILAS.ENVIAR_NOTIFICACOES, routingKey: 'notificar.*.moderado' },
      { queue: FILAS.ENVIAR_NOTIFICACOES, routingKey: 'notificar.*.entrou' },
      
      { queue: FILAS.ATUALIZAR_METRICAS, routingKey: 'metricas.*' },
      { queue: FILAS.ATUALIZAR_METRICAS, routingKey: 'metricas.#' },
      
      { queue: FILAS.RASTREAR_ANALYTICS, routingKey: 'analytics.*' },
      { queue: FILAS.RASTREAR_ANALYTICS, routingKey: 'analytics.#' },
      
      { queue: FILAS.GERAR_LLM, routingKey: 'llm.*' },
      { queue: FILAS.GERAR_LLM, routingKey: 'llm.#' },
      
      { queue: FILAS.ENVIAR_EMAILS, routingKey: 'email.*' },
      { queue: FILAS.ENVIAR_EMAILS, routingKey: 'email.#' },
    ];

    for (const binding of bindings) {
      await channel.bindQueue(
        binding.queue,
        EXCHANGES.EVENTOS_LIVRAMENTE,
        binding.routingKey
      );
    }

  }

  /*
    Publica uma mensagem em uma fila específica
   */
  async publicarNaFila(
    nomeFila: string,
    mensagem: any,
    opcoes?: {
      prioridade?: number;
      atraso?: number;
      cabecalhos?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      await this.channelWrapper.sendToQueue(nomeFila, mensagem, {
        persistent: true, // Salva mensagem em disco
        priority: opcoes?.prioridade || 0,
        headers: {
          ...opcoes?.cabecalhos,
          timestamp: Date.now(),
          retryCount: 0,
        },
      });

    } catch (error) {
      this.logger.error(`Erro ao publicar mensagem na fila ${nomeFila}:`, error);
      throw error;
    }
  }

  /*
    Publica uma mensagem usando exchange e routing key
   */
  async publish(
    RoutingKey: string,
    mensagem: any,
    opcoes?: {
      prioridade?: number;
      cabecalhos?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      await this.channelWrapper.publish(
        EXCHANGES.EVENTOS_LIVRAMENTE,
        RoutingKey,
        mensagem,
        {
          persistent: true,
          priority: opcoes?.prioridade || 0,
          headers: {
            ...opcoes?.cabecalhos,
            timestamp: Date.now(),
            retryCount: 0,
          },
        }
      );

    } catch (error) {
      this.logger.error(`Erro ao publicar evento ${RoutingKey}:`, error);
      throw error;
    }
  }

  /*
    Fecha a conexão com RabbitMQ
   */
  async onModuleDestroy() {
    try {
      await this.channelWrapper.close();
      await this.connection.close();
    } catch (error) {
      this.logger.error('Erro ao fechar conexão com RabbitMQ:', error);
    }
  }
}
