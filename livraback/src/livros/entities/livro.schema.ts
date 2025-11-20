import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LivroDocument = HydratedDocument<Livro>;

@Schema({ timestamps: true })
export class Livro {
  @Prop({ required: true })
  titulo: string;

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

  // Referência à saga, se tiver
  @Prop({ type: Types.ObjectId, ref: 'Saga' })
  saga?: Types.ObjectId;
}

export const LivroSchema = SchemaFactory.createForClass(Livro);
