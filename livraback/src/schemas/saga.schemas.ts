import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Saga extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  autor: string;

  @Prop({ required: true })
  generos: string[];

  // Referência aos livros na saga
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const SagaSchema = SchemaFactory.createForClass(Saga);