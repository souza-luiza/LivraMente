import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // referencia de userDocument fica User

// Subdocumento (_id: false)
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
class Gamificacao {
  @Prop({ default: 1 })
  nivel: number;

  @Prop({ default: 0 })
  XP: number;

  @Prop({ default: 100 }) // XP necessario para passar do nivel 1
  XP_proximo_nivel: number;
}

@Schema({ timestamps: true })
export class User {
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

  // Relacionamento com Readlist
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Readlist' }], default: [] })
  readlists: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Readlist' }], default: [] })
  readlists_favoritas: Types.ObjectId[];

  @Prop({ type: Gamificacao, required: false })
  gamificação?: Gamificacao;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  amigos: Types.ObjectId[];

  // Postagens do usuário
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }], default: [] })
  posts: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);