import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Personagem {
  @Prop({ required: true })
  nome: string;

  @Prop()
  descricao: string;
}

@Schema({ timestamps: true })
export class Livro extends Document {
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Readlist' }], default: [] })
  readlists?: Types.ObjectId[];
}

export const LivroSchema = SchemaFactory.createForClass(Livro);
