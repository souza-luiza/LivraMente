import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMQConfig } from '../queue.config';
import { FILAS, ROUTING_KEYS, CONFIG_FILA } from '../queue.constants';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { TipoNotificacao } from '../../schemas/notificacao.schema';
import { ComunidadesService } from '../../comunidades/comunidades.service';

@Injectable()
export class NotificacoesConsumer {
  private readonly logger = new Logger(NotificacoesConsumer.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificacoesService: NotificacoesService,
    private readonly comunidadesService: ComunidadesService,
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


  private async notificarPostCriado(dados: any): Promise<void> {
    const { postId, autorId, comunidadeId, conteudoPreview } = dados;

    try {
      // Buscar comunidade com membros
      const comunidade = await this.comunidadesService.findById(comunidadeId);
      const comunidadeNome = comunidade.nome;
      const preview = conteudoPreview?.substring(0, 50) || 'Novo post';

      let notificacoesEnviadas = 0;
      for (const membroId of comunidade.membros) {
        const membroIdStr = membroId.toString();
        
        if (membroIdStr !== autorId) {
          await this.notificacoesService.criar({
            usuario: membroIdStr,
            tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
            mensagem: `Novo post em ${comunidadeNome}: ${preview}...`,
            remetente: autorId,
            postId,
            comunidadeNome,
          });
          notificacoesEnviadas++;
        }
      }

    } catch (error) {
      this.logger.error(`Erro ao notificar membros sobre post ${postId}:`, error);
      throw error;
    }
  }


  private async notificarPostCurtido(dados: any): Promise<void> {
    const { postId, usuarioCurtiuId, autorPostId } = dados;

    await this.notificacoesService.criar({
      usuario: autorPostId,
      tipo: TipoNotificacao.CURTIDA_POST,
      mensagem: `Seu post recebeu uma curtida!`,
      remetente: usuarioCurtiuId,
      postId,
    });
  }

 
  private async notificarPostModerado(dados: any): Promise<void> {
    const { postId, aprovado, categoria, autorId } = dados;

    await this.notificacoesService.criar({
      usuario: autorId,
      tipo: TipoNotificacao.MODERACAO_POST,
      mensagem: aprovado
        ? `Seu post foi aprovado na categoria ${categoria}!`
        : `Seu post foi rejeitado pela moderação.`,
      postId,
    });
  }

  private async notificarMembroEntrou(dados: any): Promise<void> {
    const { userId, comunidadeId, comunidadeNome, moderadores } = dados;

    // Notificar cada moderador
    for (const moderadorId of moderadores) {
      await this.notificacoesService.criar({
        usuario: moderadorId,
        tipo: TipoNotificacao.ENTRAR_COMUNIDADE,
        mensagem: `Novo membro entrou na comunidade ${comunidadeNome}!`,
        remetente: userId,
        comunidadeNome,
      });
    }
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
