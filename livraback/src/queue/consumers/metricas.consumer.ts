import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMQConfig } from '../queue.config';
import { FILAS, ROUTING_KEYS } from '../queue.constants';

@Injectable()
export class MetricasConsumer {
  private readonly logger = new Logger(MetricasConsumer.name);
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
      
      this.logger.log('Consumer de Métricas: Conectando ao RabbitMQ...');
      
      this.connection = amqp.connect([config.url], {
        heartbeatIntervalInSeconds: config.options.heartbeat,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.logger.log('Consumer de Métricas conectado!');
      });

      this.connection.on('disconnect', ({ err }) => {
        this.logger.error('Consumer de Métricas desconectado', err);
      });

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          await channel.prefetch(5);

          await channel.consume(
            FILAS.ATUALIZAR_METRICAS,
            (msg) => this.processarMensagem(msg, channel),
            { noAck: false } 
          );

          this.logger.log(`Consumindo fila: ${FILAS.ATUALIZAR_METRICAS}`);
        },
      });

      await this.channelWrapper.waitForConnect();
      
    } catch (error) {
      this.logger.error('Erro ao conectar consumer de métricas:', error);
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
      const routingKey = msg.fields.routingKey;

      this.logger.log(`📊 Atualizando métrica: ${routingKey}`);

      switch (routingKey) {
        case ROUTING_KEYS.METRICAS_POST_CRIADO:
          await this.atualizarMetricasPost(conteudo);
          break;

        case ROUTING_KEYS.METRICAS_USUARIO_LENDO:
          await this.atualizarMetricasLeitura(conteudo);
          break;

        case ROUTING_KEYS.METRICAS_ATIVIDADE_COMUNIDADE:
          await this.atualizarMetricasComunidade(conteudo);
          break;

        default:
          this.logger.warn(`Métrica não tratada: ${routingKey}`);
      }

      channel.ack(msg);

    } catch (error) {
      this.logger.error('Erro ao processar métrica:', error);
      channel.nack(msg, false, false);
    }
  }


  private async atualizarMetricasPost(dados: any): Promise<void> {
    this.logger.log(`📝 Post criado na comunidade ${dados.comunidadeId}`);
    this.logger.log(`   Categoria: ${dados.categoria}`);
    
    
    this.logger.log(`   💡 Métricas a atualizar:`);
    this.logger.log(`      - comunidade.totalPosts++`);
    this.logger.log(`      - comunidade.ultimaAtividade = now()`);
    this.logger.log(`      - autor.totalPosts++`);
    this.logger.log(`      - categoria.${dados.categoria}.count++`);
  }


  private async atualizarMetricasLeitura(dados: any): Promise<void> {
    this.logger.log(`📖 Usuário ${dados.userId} lendo livro ${dados.livroId}`);
    this.logger.log(`   Progresso: ${dados.paginaAtual}/${dados.totalPaginas}`);
    
    
    this.logger.log(`   💡 Atualizações:`);
    this.logger.log(`      - usuario.tempoLeituraTotal += ${dados.tempoSessao}min`);
    this.logger.log(`      - livro.progresso = ${Math.round((dados.paginaAtual / dados.totalPaginas) * 100)}%`);
    this.logger.log(`      - usuario.pontosGamificacao += 10`);
  }


  private async atualizarMetricasComunidade(dados: any): Promise<void> {
    this.logger.log(`🏘️ Atividade na comunidade ${dados.comunidadeId}`);
    this.logger.log(`   Tipo: ${dados.tipoAtividade}`);
    

    this.logger.log(`   💡 Métricas:`);
    this.logger.log(`      - comunidade.atividadesDia++`);
    this.logger.log(`      - comunidade.membrosAtivos.add(${dados.userId})`);
    this.logger.log(`      - comunidade.taxaEngajamento = recalcular()`);
  }


  async onModuleDestroy() {
    try {
      await this.channelWrapper.close();
      await this.connection.close();
      this.logger.log('Consumer de Métricas desconectado');
    } catch (error) {
      this.logger.error('Erro ao fechar consumer:', error);
    }
  }
}
