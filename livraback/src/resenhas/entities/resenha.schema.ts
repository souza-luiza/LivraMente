import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ResenhaDocument = HydratedDocument<Resenha>;

@Schema({ timestamps: true })
export class Resenha extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Livro', required: true })
  livro: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  avaliacao: number; // Nota de 1 a 5 estrelas

  @Prop({ default: '' })
  conteudo: string;

  @Prop({ default: false })
  spoiler: boolean;
  
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[]; 

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comentario' }], default: [] })
  comentarios: Types.ObjectId[]; 
}

export const ResenhaSchema = SchemaFactory.createForClass(Resenha);
