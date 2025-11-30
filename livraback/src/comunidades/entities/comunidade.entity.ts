import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComunidadeDocument = HydratedDocument<Comunidade>;

@Schema({ timestamps: true })
export class Comunidade {
  @Prop({ required: true, unique: true })
  nome: string;
  
  @Prop()
  descricao?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  moderadores: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  membros: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }], default: [] })
  posts: Types.ObjectId[];

  @Prop({ required: false, default: '/CommunityDefault.png' })
  capaUrl?: string;

  @Prop({ required: false, default: '' })
  capaPublicId?: string;

  @Prop({ required: false, default: '' })
  bannerUrl?: string;

  @Prop({ required: false, default: '' })
  bannerPublicId?: string;
  
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop()
  slug?: string;

  @Prop({ type: Types.ObjectId, ref: 'Livro' })
  livro?: Types.ObjectId;
}

export const ComunidadeSchema = SchemaFactory.createForClass(Comunidade);