import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReadlistDocument = HydratedDocument<Readlist>;

@Schema({ timestamps: true })
export class Readlist {
  @Prop({ required: true })
  nome: string;
  
  @Prop({ default: false })
  publica: boolean;

  @Prop({ required: false, default: '' })
  descricao?: string;

  @Prop({ required: false, default: '/ReadlistDefault.png' })
  capa_url?: string;

  @Prop({ required: false, default: '' })
  capa_public_id?: string;

  @Prop({ required: false })
  slug: string;

  // Referência ao usuário que criou a readlist
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  criador: Types.ObjectId;

  // Referência aos livros na readlist
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const ReadlistSchema = SchemaFactory.createForClass(Readlist);