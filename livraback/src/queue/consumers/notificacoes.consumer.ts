import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMQConfig } from '../queue.config';
import { FILAS, ROUTING_KEYS, CONFIG_FILA } from '../queue.constants';

@Injectable()
export class NotificacoesConsumer {
  private readonly logger = new Logger(NotificacoesConsumer.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly configService: ConfigService,
  ) {}

 
  async inicializar(): Promise<void> {
    await this.conectar();
  }

  /**
   * Conecta ao RabbitMQ e inicia consumo da fila
   */
  private async conectar(): Promise<void> {
    try {
      const config = getRabbitMQConfig(this.configService);
      
      this.logger.log('Consumer de Notificações: Conectando ao RabbitMQ...');
      
      this.connection = amqp.connect([config.url], {
        heartbeatIntervalInSeconds: config.options.heartbeat,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.logger.log('Consumer de Notificações conectado!');
      });

      this.connection.on('disconnect', ({ err }) => {
        this.logger.error('Consumer de Notificações desconectado', err);
      });

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          await channel.prefetch(1);

          await channel.consume(
            FILAS.ENVIAR_NOTIFICACOES,
            (msg) => this.processarMensagem(msg, channel),
            { noAck: false } 
          );

          this.logger.log(`Consumindo fila: ${FILAS.ENVIAR_NOTIFICACOES}`);
        },
      });

      await this.channelWrapper.waitForConnect();
      
    } catch (error) {
      this.logger.error('Erro ao conectar consumer de notificações:', error);
      throw error;
    }
  }

  /**
   * Processa mensagem da fila
   */
  private async processarMensagem(
    msg: ConsumeMessage | null,
    channel: ConfirmChannel,
  ): Promise<void> {
    if (!msg) return;

    try {
      const conteudo = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;


      switch (routingKey) {
        case ROUTING_KEYS.NOTIFICAR_POST_CRIADO:
          await this.notificarPostCriado(conteudo);
          break;

        case ROUTING_KEYS.NOTIFICAR_POST_CURTIDO:
          await this.notificarPostCurtido(conteudo);
          break;

        case ROUTING_KEYS.NOTIFICAR_POST_MODERADO:
          await this.notificarPostModerado(conteudo);
          break;

        case ROUTING_KEYS.NOTIFICAR_MEMBRO_ENTROU:
          await this.notificarMembroEntrou(conteudo);
          break;

        default:
          this.logger.warn(`Tipo de notificação não tratado: ${routingKey}`);
      }

      channel.ack(msg);

    } catch (error) {
      this.logger.error('Erro ao processar mensagem:', error);
      
      const retryCount = (msg.properties.headers?.retryCount || 0) + 1;
      
      if (retryCount < CONFIG_FILA.MAX_TENTATIVAS) {
        this.logger.warn(`Tentativa ${retryCount}/${CONFIG_FILA.MAX_TENTATIVAS} - Reenfileirando...`);
        // Rejeita e recoloca na fila para retry
        channel.nack(msg, false, true);
      } else {
        this.logger.error(`Máximo de tentativas atingido - Enviando para DLQ`);
        // Rejeita e envia para Dead Letter Queue
        channel.nack(msg, false, false);
      }
    }
  }

  /**
   * Cria notificação de post criado
   */
  private async notificarPostCriado(dados: any): Promise<void> {
    this.logger.log(`NOTIFICAÇÃO: Novo post criado`);
  }


  private async notificarPostCurtido(dados: any): Promise<void> {
    this.logger.log(`NOTIFICAÇÃO: Post curtido!`);
  }

 
  private async notificarPostModerado(dados: any): Promise<void> {
    this.logger.log(`NOTIFICAÇÃO: Post moderado`);
  }

  private async notificarMembroEntrou(dados: any): Promise<void> {
    this.logger.log(`NOTIFICAÇÃO: Novo membro na comunidade!`);
  }

  /**
   * Fecha conexão ao desligar aplicação
   */
  async onModuleDestroy() {
    try {
      await this.channelWrapper.close();
      await this.connection.close();
      this.logger.log('Consumer de Notificações desconectado');
    } catch (error) {
      this.logger.error('Erro ao fechar consumer:', error);
    }
  }
}
