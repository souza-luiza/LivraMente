import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Autor extends Document {
  @Prop({ required: true })
  nome: string;

  @Prop()
  biografia?: string;

  @Prop()
  data_nascimento?: Date;

  @Prop()
  nacionalidade?: string;

  @Prop()
  foto_url?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const AutorSchema = SchemaFactory.createForClass(Autor);
