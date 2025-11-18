import { Injectable } from '@nestjs/common';
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

@Injectable()
export class NotificacoesService {
  private notificacoesStream = new Map<string, Subject<Notificacao>>();

  constructor(
    @InjectModel(Notificacao.name)
    private notificacaoModel: Model<NotificacaoDocument>,
  ) {}


  async criar(dto: CriarNotificacaoDto): Promise<Notificacao> {
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

    this.emitirParaUsuario(dto.usuario, populated.toObject());

    return populated;
  }


  async buscarTodas(userId: string): Promise<Notificacao[]> {
    return this.notificacaoModel
      .find({ usuario: new Types.ObjectId(userId) })
      .populate('remetente', 'username foto_perfil')
      .sort({ createdAt: -1 })
      .exec();
  }


  async marcarComoLida(notificacaoId: string, userId: string): Promise<void> {
    await this.notificacaoModel.updateOne(
      {
        _id: new Types.ObjectId(notificacaoId),
        usuario: new Types.ObjectId(userId),
      },
      { lida: true }
    );
  }


  async marcarTodasComoLidas(userId: string): Promise<void> {
    await this.notificacaoModel.updateMany(
      { usuario: new Types.ObjectId(userId), lida: false },
      { lida: true }
    );
  }

  async remover(notificacaoId: string, userId: string): Promise<void> {
    await this.notificacaoModel.deleteOne({
      _id: new Types.ObjectId(notificacaoId),
      usuario: new Types.ObjectId(userId),
    });
  }


  registrarClienteSSE(userId: string): Subject<Notificacao> {
    if (!this.notificacoesStream.has(userId)) {
      this.notificacoesStream.set(userId, new Subject<Notificacao>());
    }
    return this.notificacoesStream.get(userId)!;
  }


  removerClienteSSE(userId: string): void {
    const subject = this.notificacoesStream.get(userId);
    if (subject) {
      subject.complete();
      this.notificacoesStream.delete(userId);
    }
  }


  private emitirParaUsuario(userId: string, notificacao: any): void {
    const subject = this.notificacoesStream.get(userId);
    if (subject) {
      subject.next(notificacao);
    }
  }
}
