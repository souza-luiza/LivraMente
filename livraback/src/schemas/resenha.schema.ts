import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Resenha extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Livro', required: true })
  livro: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  avaliacao: number; // Nota de 1 a 5 estrelas

  @Prop({ required: true })
  conteudo: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];

  @Prop({ default: false })
  spoiler: boolean;

  // Comentários na resenha
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comentario' }], default: [] })
  comentarios: Types.ObjectId[];
}

export const ResenhaSchema = SchemaFactory.createForClass(Resenha);
