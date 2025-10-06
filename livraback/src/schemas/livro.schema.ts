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

  @Prop({ type: [Personagem], required: false })
  personagens: Personagem[];

  @Prop()
  citacoes?: string[];

  @Prop()
  curiosidades?: string[];

  // Campos nao obrigatorios tem uma "?" 
  @Prop()
  editora?: string;

  @Prop()
  capa_url?: string;

  @Prop()
  ordem_na_saga?: number;

  // Referência à saga, se tiver
  @Prop({ type: Types.ObjectId, ref: 'Saga' })
  saga?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Readlist' }], default: [] })
  readlists?: Types.ObjectId[];

  // Quizzes relacionados ao livro
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quiz' }], default: [] })
  quizzes?: Types.ObjectId[];

  // Resenhas do livro
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Resenha' }], default: [] })
  resenhas?: Types.ObjectId[];

  @Prop({ default: 0 })
  avaliacoes_count: number;  // Quantas pessoas avaliaram

  @Prop({ default: 0 })
  avaliacoes_media: number;  // Média das estrelas (float de 1-5)
}

export const LivroSchema = SchemaFactory.createForClass(Livro);
