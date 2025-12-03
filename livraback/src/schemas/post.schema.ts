import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CloudinaryImage, CloudinaryImageSchema } from '../cloudinary/entities/image.schema';

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

  @Prop({ type: [CloudinaryImageSchema], default: [] })
  imagens: CloudinaryImage[];

  @Prop({ type: String, enum: PostCategoria, default: PostCategoria.GERAL })
  categoria: PostCategoria;

  @Prop({ type: String, enum: PostStatus, default: PostStatus.PUBLICADO })
  status: PostStatus;

  @Prop({ default: false })
  solicitacao_revisao: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comentario' }], default: [] })
  comentarios: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Comunidade', required: true })
  comunidade: Types.ObjectId;

  @Prop({ default: true })
  publico: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
