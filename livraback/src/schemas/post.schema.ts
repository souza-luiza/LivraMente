import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PostCategoria {
  GERAL = 'geral',
  FANART = 'fanart',
  FANFIC = 'fanfic',
}

export enum PostStatus {
  PUBLICADO = 'publicado',
  PENDENTE_MODERACAO = 'pendente_moderacao',
  REJEITADO = 'rejeitado',
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true })
  conteudo: string;

  @Prop({ type: [String], default: [] })
  imagens: string[];

  @Prop({ type: String, enum: PostCategoria, default: PostCategoria.GERAL })
  categoria: PostCategoria;

  @Prop({ type: String, enum: PostStatus, default: PostStatus.PUBLICADO })
  status: PostStatus;

  @Prop({ default: false })
  solicitacao_revisao: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Livro' })
  livro_referenciado?: Types.ObjectId;

  // Curtidas - array de usuários que curtiram
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];

  // Comentários - array de referências
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comentario' }], default: [] })
  comentarios: Types.ObjectId[];

  // Comunidade onde o post foi feito
  @Prop({ type: Types.ObjectId, ref: 'Comunidade', required: true })
  comunidade: Types.ObjectId;

  @Prop({ default: true })
  publico: boolean;

  // Tags/Topics
  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
