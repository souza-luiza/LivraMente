import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Questao {
  @Prop({ required: true })
  pergunta: string;

  @Prop({ type: [String], required: true })
  opcoes: string[]; 

  @Prop({ required: true })
  resposta_correta: number; // Índice da resposta correta 

  @Prop()
  explicacao?: string; 
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descricao?: string;

  @Prop({ type: Types.ObjectId, ref: 'Livro', required: true })
  livro: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  criador: Types.ObjectId;

  @Prop({ type: [Questao], required: true })
  questoes: Questao[];

  @Prop({ default: 'facil' })
  dificuldade: string; // 'facil', 'medio', 'dificil'

  @Prop({ default: 0 })
  pontuacao_media: number; // Média de acertos

  // Curtidas no quiz
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  curtidas: Types.ObjectId[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);