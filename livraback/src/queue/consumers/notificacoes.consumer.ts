import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FILAS, ROUTING_KEYS } from '../queue.constants';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { TipoNotificacao } from '../../schemas/notificacao.schema';
import { ComunidadesService } from '../../comunidades/comunidades.service';
import { BaseConsumer } from './base-consumer.abstract';
import {
  PostCriadoEventDto,
  PostCurtidoEventDto,
  PostModeradoEventDto,
  MembroEntrouEventDto,
} from '../dto';

/**
 * Consumer responsável por processar eventos de notificação
 * Escuta a fila de notificações e cria notificações para os usuários
 * 
 * @example
 * - Novo post criado → notifica membros da comunidade
 * - Post curtido → notifica autor
 * - Post moderado → notifica autor
 * - Membro entrou → notifica moderadores
 */
@Injectable()
export class NotificacoesConsumer extends BaseConsumer {
  constructor(
    configService: ConfigService,
    private readonly notificacoesService: NotificacoesService,
    private readonly comunidadesService: ComunidadesService,
  ) {
    super(configService, NotificacoesConsumer.name);
  }

  protected getQueueName(): string {
    return FILAS.ENVIAR_NOTIFICACOES;
  }

  protected getPrefetchCount(): number {
    return 1; // Processa uma notificação por vez para garantir ordem
  }

  protected async processar(conteudo: any, routingKey: string): Promise<void> {
    switch (routingKey) {
      case ROUTING_KEYS.NOTIFICAR_POST_CRIADO:
        await this.notificarPostCriado(conteudo as PostCriadoEventDto);
        break;

      case ROUTING_KEYS.NOTIFICAR_POST_CURTIDO:
        await this.notificarPostCurtido(conteudo as PostCurtidoEventDto);
        break;

      case ROUTING_KEYS.NOTIFICAR_POST_MODERADO:
        await this.notificarPostModerado(conteudo as PostModeradoEventDto);
        break;

      case ROUTING_KEYS.NOTIFICAR_MEMBRO_ENTROU:
        await this.notificarMembroEntrou(conteudo as MembroEntrouEventDto);
        break;

      default:
        this.logger.warn(`Tipo de notificação não tratado: ${routingKey}`);
    }
  }

  /**
   * Notifica membros da comunidade sobre novo post
   * @param dados - Dados do evento de post criado
   */
  private async notificarPostCriado(dados: PostCriadoEventDto): Promise<void> {
    const { postId, autorId, comunidadeId, conteudo } = dados;

    try {
      const comunidade = await this.comunidadesService.findById(comunidadeId);

      // Notificar cada membro da comunidade (exceto o autor)
      for (const membroId of comunidade.membros) {
        const membroIdStr = membroId.toString();

        if (membroIdStr !== autorId) {
          await this.notificacoesService.criar({
            usuario: membroIdStr,
            tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
            mensagem: `Novo post em ${comunidade.nome}: ${conteudo.substring(0, 50)}...`,
            remetente: autorId,
            postId,
            comunidadeNome: comunidade.nome,
          });
        }
      }

      this.logger.log(`Notificações de novo post enviadas para ${comunidade.membros.length - 1} membros`);
    } catch (error) {
      this.logger.error(`Erro ao notificar sobre novo post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Notifica autor do post quando recebe uma curtida
   * @param dados - Dados do evento de curtida
   */
  private async notificarPostCurtido(dados: PostCurtidoEventDto): Promise<void> {
    const { postId, userId, autorId } = dados;

    // Não notificar se o usuário curtir o próprio post
    if (userId === autorId) {
      this.logger.debug('Auto-curtida detectada, notificação não enviada');
      return;
    }

    try {
      await this.notificacoesService.criar({
        usuario: autorId,
        tipo: TipoNotificacao.CURTIDA_POST,
        mensagem: 'Seu post foi curtido!',
        remetente: userId,
        postId,
      });

      this.logger.debug(`Notificação de curtida enviada para autor ${autorId}`);
    } catch (error) {
      this.logger.error(`Erro ao notificar curtida do post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Notifica autor sobre resultado da moderação do post
   * @param dados - Dados do evento de moderação
   */
  private async notificarPostModerado(dados: PostModeradoEventDto): Promise<void> {
    const { postId, aprovado, categoria, autorId } = dados;

    this.logger.log(`Processando notificação de moderação - Post: ${postId}, Autor: ${autorId}, Aprovado: ${aprovado}`);

    try {
      const mensagem = aprovado
        ? `Seu post foi aprovado na categoria ${categoria}!`
        : `Seu post foi rejeitado pela moderação.`;

      await this.notificacoesService.criar({
        usuario: autorId,
        tipo: TipoNotificacao.MODERACAO_POST,
        mensagem,
        postId,
      });

      this.logger.log(`Notificação de moderação criada com sucesso para autor: ${autorId}`);
    } catch (error) {
      this.logger.error(`Erro ao notificar moderação do post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Notifica moderadores quando novo membro entra na comunidade
   * @param dados - Dados do evento de entrada de membro
   */
  private async notificarMembroEntrou(dados: MembroEntrouEventDto): Promise<void> {
    const { userId, comunidadeId, comunidadeNome } = dados;

    try {
      const comunidade = await this.comunidadesService.findById(comunidadeId);

      // Notificar cada moderador
      for (const moderadorId of comunidade.moderadores) {
        const moderadorIdStr = moderadorId.toString();

        // Não notificar se o próprio usuário é moderador
        if (moderadorIdStr !== userId) {
          await this.notificacoesService.criar({
            usuario: moderadorIdStr,
            tipo: TipoNotificacao.ENTRAR_COMUNIDADE,
            mensagem: `Novo membro entrou na comunidade ${comunidade.nome}!`,
            remetente: userId,
            comunidadeNome: comunidade.nome,
          });
        }
      }

      this.logger.log(`Notificações de novo membro enviadas para ${comunidade.moderadores.length} moderadores`);
    } catch (error) {
      this.logger.error(`Erro ao notificar moderadores sobre novo membro em ${comunidadeNome}:`, error);
      throw error;
    }
  }
}
