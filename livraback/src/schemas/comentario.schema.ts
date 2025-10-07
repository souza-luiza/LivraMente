import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// timestamps: createdAt e updatedAt automáticos 
@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ required: true })
  conteudo: string;

  // Curtidas no comentário
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];

  // Para respostas a comentários (thread)
  @Prop({ type: Types.ObjectId, ref: 'Comentario' })
  comentario_pai?: Types.ObjectId;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);