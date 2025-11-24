import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notificacao, NotificacaoDocument, TipoNotificacao } from '../schemas/notificacao.schema';
import { Subject } from 'rxjs';

export interface CriarNotificacaoDto {
  usuario: string;
  tipo: TipoNotificacao;
  mensagem: string;
  remetente?: string;
  postId?: string;
  comentarioId?: string;
  resenhaId?: string;
  readlistId?: string;
  comunidadeNome?: string;
}

/**
 * Serviço responsável por gerenciar notificações
 * Implementa CRUD e streaming via SSE
 */
@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);
  private notificacoesStream = new Map<string, Subject<Notificacao>>();

  constructor(
    @InjectModel(Notificacao.name)
    private notificacaoModel: Model<NotificacaoDocument>,
  ) {}

  /**
   * Cria uma nova notificação e emite via SSE para o usuário
   * @param dto - Dados da notificação
   * @returns Notificação criada
   */
  async criar(dto: CriarNotificacaoDto): Promise<Notificacao> {
    try {
      const notificacao = await this.notificacaoModel.create({
        usuario: new Types.ObjectId(dto.usuario),
        tipo: dto.tipo,
        mensagem: dto.mensagem,
        remetente: dto.remetente ? new Types.ObjectId(dto.remetente) : undefined,
        postId: dto.postId ? new Types.ObjectId(dto.postId) : undefined,
        comentarioId: dto.comentarioId ? new Types.ObjectId(dto.comentarioId) : undefined,
        resenhaId: dto.resenhaId ? new Types.ObjectId(dto.resenhaId) : undefined,
        readlistId: dto.readlistId ? new Types.ObjectId(dto.readlistId) : undefined,
        comunidadeNome: dto.comunidadeNome,
        lida: false,
      });

      const populated = await notificacao.populate('remetente', 'username foto_perfil');

      // Emite via SSE se o usuário estiver conectado
      this.emitirParaUsuario(dto.usuario, populated.toObject());

      this.logger.debug(`Notificação criada: ${notificacao._id} para usuário: ${dto.usuario}`);

      return populated;
    } catch (error) {
      this.logger.error('Erro ao criar notificação:', error);
      throw error;
    }
  }


  /**
   * Busca todas as notificações de um usuário
   * @param userId - ID do usuário
   * @returns Lista de notificações ordenadas por data
   */
  async buscarTodas(userId: string): Promise<Notificacao[]> {
    return this.notificacaoModel
      .find({ usuario: new Types.ObjectId(userId) })
      .populate('remetente', 'username foto_perfil')
      .sort({ createdAt: -1 })
      .exec();
  }


  /**
   * Marca uma notificação como lida
   * @param notificacaoId - ID da notificação
   * @param userId - ID do usuário (para validação)
   */
  async marcarComoLida(notificacaoId: string, userId: string): Promise<void> {
    const result = await this.notificacaoModel.updateOne(
      {
        _id: new Types.ObjectId(notificacaoId),
        usuario: new Types.ObjectId(userId),
      },
      { lida: true }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Notificação não encontrada');
    }
  }


  /**
   * Marca todas as notificações de um usuário como lidas
   * @param userId - ID do usuário
   */
  async marcarTodasComoLidas(userId: string): Promise<void> {
    await this.notificacaoModel.updateMany(
      { usuario: new Types.ObjectId(userId), lida: false },
      { lida: true }
    );
  }

  /**
   * Remove uma notificação específica
   * @param notificacaoId - ID da notificação
   * @param userId - ID do usuário (para validação)
   */
  async remover(notificacaoId: string, userId: string): Promise<void> {
    const result = await this.notificacaoModel.deleteOne({
      _id: new Types.ObjectId(notificacaoId),
      usuario: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notificação não encontrada');
    }
  }


  /**
   * Registra um cliente SSE para receber notificações em tempo real
   * @param userId - ID do usuário
   * @returns Subject Observable para streaming
   */
  registrarClienteSSE(userId: string): Subject<Notificacao> {
    if (!this.notificacoesStream.has(userId)) {
      this.notificacoesStream.set(userId, new Subject<Notificacao>());
      this.logger.log(`Cliente SSE registrado: ${userId}`);
    }
    return this.notificacoesStream.get(userId)!;
  }


  /**
   * Remove cliente SSE quando desconectar
   * @param userId - ID do usuário
   */
  removerClienteSSE(userId: string): void {
    const subject = this.notificacoesStream.get(userId);
    if (subject) {
      subject.complete();
      this.notificacoesStream.delete(userId);
      this.logger.log(`Cliente SSE removido: ${userId}`);
    }
  }


  /**
   * Emite notificação via SSE para usuário conectado
   * @param userId - ID do usuário
   * @param notificacao - Notificação a ser emitida
   */
  private emitirParaUsuario(userId: string, notificacao: any): void {
    const subject = this.notificacoesStream.get(userId);
    if (subject) {
      subject.next(notificacao);
      this.logger.debug(`Notificação emitida via SSE para usuário: ${userId}`);
    }
  }
}
