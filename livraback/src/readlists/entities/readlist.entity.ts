import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';

export type ReadlistDocument = HydratedDocument<Readlist>;

@Schema({ timestamps: true })
export class Readlist {
  @Prop({ required: true })
  nome: string;

  @Prop({ default: true })
  favorito: boolean;
  
  @Prop({ default: false })
  publica: boolean;

  @Prop({ required: false, default: '' })
  descricao?: string;

  @Prop({ required: false, default: '/Readlist.svg' })
  capa_url?: string;

  @Prop({ required: false, default: '' })
  capa_public_id?: string;

  @Prop({ required: false })
  slug: string;

  // Referência ao usuário que criou a readlist
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  criador: Types.ObjectId;

  // Referência aos livros na readlist
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Livro' }], default: [] })
  livros: Types.ObjectId[];
}

export const ReadlistSchema = SchemaFactory.createForClass(Readlist);

ReadlistSchema.pre('save', async function (next) {
  // Gera slug apenas se criar readlist ou modificar nome
  if(this.isModified('nome')) {
    const baseSlug = slugify(this.nome, { lower: true, strict: true });
    let slug = baseSlug;
    let cont = 1;

    // Garante unicidade de slugs entre readlists do mesmo usuario
    const Model = this.constructor as Model<ReadlistDocument>;
    while(await Model.exists({ slug, criador: this.criador })) {
      slug = `${baseSlug}-${cont++}`;
    }

    this.slug = slug;
  }

  next();
})