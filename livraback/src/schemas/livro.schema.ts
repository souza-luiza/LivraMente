import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Livro extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  isbn: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Autor' }], default: [] })
  autores: Types.ObjectId[];

  @Prop()
  editora?: string;

  @Prop()
  ano_publicacao?: number;

  @Prop()
  sinopse?: string;

  @Prop({ type: [String], default: [] })
  generos: string[];

  @Prop()
  capa_url?: string;

  @Prop()
  numero_paginas?: number;

  @Prop({ type: Types.ObjectId, ref: 'Saga' })
  saga?: Types.ObjectId;

  @Prop()
  ordem_saga?: number;

  @Prop({ default: 0 })
  avaliacoes_count: number;

  @Prop({ default: 0 })
  avaliacoes_media: number;
}

export const LivroSchema = SchemaFactory.createForClass(Livro);
