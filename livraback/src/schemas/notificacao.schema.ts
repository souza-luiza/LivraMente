import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificacaoDocument = Notificacao & Document;

export enum TipoNotificacao {
  CURTIDA_POST = 'curtida_post',
  CURTIDA_COMENTARIO = 'curtida_comentario',
  CURTIDA_RESENHA = 'curtida_resenha',
  COMENTARIO_POST = 'comentario_post',
  COMENTARIO_RESENHA = 'comentario_resenha',
  RESPOSTA_COMENTARIO = 'resposta_comentario',
  MENCAO = 'mencao',
  NOVO_SEGUIDOR = 'novo_seguidor',
  FAVORITAR_READLIST = 'favoritar_readlist',
  ENTRAR_COMUNIDADE = 'entrar_comunidade',
  MODERACAO_POST = 'moderacao_post',
  PROMOVIDO_MODERADOR = 'promovido_moderador',
  NOVO_POST_COMUNIDADE = 'novo_post_comunidade',
}

@Schema({ timestamps: true })
export class Notificacao {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId; 

  @Prop({ type: String, enum: TipoNotificacao, required: true })
  tipo: TipoNotificacao;

  @Prop({ required: true })
  mensagem: string;

  @Prop({ default: false })
  lida: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  remetente?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comentario' })
  comentarioId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Resenha' })
  resenhaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Readlist' })
  readlistId?: Types.ObjectId;

  @Prop({ type: String })
  comunidadeNome?: string;
}

export const NotificacaoSchema = SchemaFactory.createForClass(Notificacao);
