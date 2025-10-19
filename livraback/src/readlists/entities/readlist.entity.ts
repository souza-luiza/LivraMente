import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReadlistDocument = HydratedDocument<Readlist>;

@Schema({ timestamps: true })
export class Readlist {
  @Prop({ required: true })
  nome: string;

  @Prop({ default: true })
  favorito: boolean;
  
  @Prop({ default: false })
  publica: boolean;

  @Prop()
  descricao?: string;

  @Prop()
  capa_url?: string;

  // Referência ao usuário que criou a readlist
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  criador: Types.ObjectId;

  // Referência aos livros na readlist
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const ReadlistSchema = SchemaFactory.createForClass(Readlist);