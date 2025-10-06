import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comunidade extends Document {
  @Prop({ required: true, unique: true })
  nome: string;
  
  @Prop()
  descricao?: string;  

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  criador: Types.ObjectId;

  // Moderadores da comunidade
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  moderadores: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  membros: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }], default: [] })
  posts: Types.ObjectId[];

  @Prop()
  imagem_url?: string;

  // Comunidade pública ou privada
  @Prop({ default: true })
  publica: boolean;

  // Regras da comunidade
  @Prop({ type: [String], default: [] })
  regras?: string[];

  // Tags/categorias da comunidade
  @Prop({ type: [String], default: [] })
  tags?: string[];

  // Livro principal da comunidade 
  @Prop({ type: Types.ObjectId, ref: 'Livro' })
  livro_principal?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Saga' })
  saga_principal?: Types.ObjectId;
}

export const ComunidadeSchema = SchemaFactory.createForClass(Comunidade);