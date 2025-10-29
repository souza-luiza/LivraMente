import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComunidadeDocument = HydratedDocument<Comunidade>;

@Schema({ timestamps: true })
export class Comunidade {
  @Prop({ required: true, unique: true })
  nome: string;
  
  @Prop()
  descricao?: string;

  /*@Prop({ type: Types.ObjectId, ref: 'User' })
  criador: Types.ObjectId;*/ // acho que nao precisa

  // Moderadores da comunidade
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  moderadores: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  membros: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }], default: [] })
  posts: Types.ObjectId[];

  @Prop()
  imagem_url?: string;

  /*// Comunidade pública ou privada
  @Prop({ default: true })
  publica: boolean;*/ // todas serem públicas

  // Regras da comunidade
  /*@Prop({ type: [String], default: [] })
  regras?: string[]; */ // nao ter isso (moderadores aprovam se quiserem)

  // Tags/categorias da comunidade (gêneros)
  @Prop({ type: [String], default: [] })
  tags?: string[];

  // Livro principal da comunidade 
  /*@Prop({ type: Types.ObjectId, ref: 'Livro' })
  livro_principal?: Types.ObjectId; // nao precisa

  @Prop({ type: Types.ObjectId, ref: 'Saga' })
  saga_principal?: Types.ObjectId;*/ //acredito que nao precisa disso
}

export const ComunidadeSchema = SchemaFactory.createForClass(Comunidade);