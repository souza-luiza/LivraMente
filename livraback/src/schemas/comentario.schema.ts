import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CloudinaryImage, CloudinaryImageSchema } from 'src/cloudinary/entities/image.schema';

// timestamps: createdAt e updatedAt automáticos 
@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ required: true })
  conteudo: string;
  
  @Prop({ type: [CloudinaryImageSchema], default: [] })
  imagens: CloudinaryImage[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);