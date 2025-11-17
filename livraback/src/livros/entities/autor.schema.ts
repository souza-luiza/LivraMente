import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AutorDocument = HydratedDocument<Autor>;

@Schema({ timestamps: true })
export class Autor {
  @Prop({ required: true })
  nome: string;

  @Prop()
  foto_url?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const AutorSchema = SchemaFactory.createForClass(Autor);
