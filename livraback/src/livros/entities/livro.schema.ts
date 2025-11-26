import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LivroDocument = HydratedDocument<Livro>;

@Schema({ timestamps: true })
export class Livro {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: false })
  slug: string;

  @Prop({ required: true })
  isbn: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Autor' }], default: [] })
  autores: Types.ObjectId[];

  @Prop()
  ano_publicacao: number;
  
  @Prop()
  sinopse: string;

  @Prop()
  numero_paginas: number;

  @Prop({ type: [String], default: [] })
  generos: string[];

  @Prop()
  citacoes?: string[];

  @Prop()
  editora?: string;

  @Prop()
  capa_url?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Readlist' }], default: [] })
  readlists?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comunidade' }], default: [] })
  comunidades?: Types.ObjectId[];

  // Resenhas do livro
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Resenha' }], default: [] })
  resenhas?: Types.ObjectId[];

  @Prop({ default: 0 })
  avaliacoes_count: number;  // Quantas pessoas avaliaram

  @Prop({ default: 0 })
  avaliacoes_media: number;  // Média das estrelas (float de 1-5)
}

export const LivroSchema = SchemaFactory.createForClass(Livro);
