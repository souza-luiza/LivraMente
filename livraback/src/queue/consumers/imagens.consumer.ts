import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMQConfig } from '../queue.config';
import { FILAS } from '../queue.constants';

@Injectable()
export class ImagensConsumer {
  private readonly logger = new Logger(ImagensConsumer.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly configService: ConfigService,
  ) {}


  async inicializar(): Promise<void> {
    await this.conectar();
  }

  private async conectar(): Promise<void> {
    try {
      const config = getRabbitMQConfig(this.configService);
      
      this.logger.log('Consumer de Imagens: Conectando ao RabbitMQ...');
      
      this.connection = amqp.connect([config.url], {
        heartbeatIntervalInSeconds: config.options.heartbeat,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.logger.log('Consumer de Imagens conectado!');
      });

      this.connection.on('disconnect', ({ err }) => {
        this.logger.error('Consumer de Imagens desconectado', err);
      });

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          // Processa 3 imagens simultaneamente
          await channel.prefetch(3);

          await channel.consume(
            FILAS.PROCESSAR_IMAGENS,
            (msg) => this.processarMensagem(msg, channel),
            { noAck: false } 
          );

          this.logger.log(`Consumindo fila: ${FILAS.PROCESSAR_IMAGENS}`);
        },
      });

      await this.channelWrapper.waitForConnect();
      
    } catch (error) {
      this.logger.error('Erro ao conectar consumer de imagens:', error);
      throw error;
    }
  }


  private async processarMensagem(
    msg: ConsumeMessage | null,
    channel: ConfirmChannel,
  ): Promise<void> {
    if (!msg) return;

    try {
      const conteudo = JSON.parse(msg.content.toString());

      switch (conteudo.tipo) {
        case 'post':
          await this.processarImagensPost(conteudo);
          break;

        case 'perfil':
          await this.processarImagemPerfil(conteudo);
          break;

        case 'comunidade':
          await this.processarImagemComunidade(conteudo);
          break;

        default:
          this.logger.warn(`Tipo de imagem não tratado: ${conteudo.tipo}`);
      }

      channel.ack(msg);

    } catch (error) {
      this.logger.error('Erro ao processar mensagem:', error);
      
      channel.nack(msg, false, false); 
    }
  }

  private async processarImagensPost(dados: any): Promise<void> {
    // TODO: Validar, redimensionar, otimizar, upload CDN
  }

  private async processarImagemPerfil(dados: any): Promise<void> {
    // TODO: Avatar circular, thumbnail, upload CDN
  }


  private async processarImagemComunidade(dados: any): Promise<void> {
    // TODO: Redimensionar para diferentes resoluções
  }


  async onModuleDestroy() {
    try {
      await this.channelWrapper.close();
      await this.connection.close();
      this.logger.log('Consumer de Imagens desconectado');
    } catch (error) {
      this.logger.error('Erro ao fechar consumer:', error);
    }
  }
}
