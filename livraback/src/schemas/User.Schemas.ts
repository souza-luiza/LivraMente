import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Perfil {
  @Prop({ required: true })
  tipo_perfil: string;

  @Prop({ type: [String], default: [] })
  generos_favoritos: string[];
}

@Schema({ _id: false })
class Estante {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  lidos: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  para_ler: Types.ObjectId[];
}

@Schema({ _id: false })
class Readlist {
  @Prop({ required: true })
  nome_readlist: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

@Schema({ _id: false })
class Gamificacao {
  @Prop({ default: 1 })
  nivel: number;

  @Prop({ default: 0 })
  XP: number;
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  nome: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  senha: string;

  @Prop({ type: Perfil, required: false })
  perfil?: Perfil;

  @Prop({ type: Estante, required: false })
  estante?: Estante;

  @Prop({ type: [Readlist], default: [] })
  readlists: Readlist[];

  @Prop({ type: Gamificacao, required: false })
  gamificação?: Gamificacao;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  amigos: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
