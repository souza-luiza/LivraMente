import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';

@Injectable()
export class LlmPromptService {

  private readonly DEFAULT_GENRES_POOL = [
    'Fantasia',
    'Aventura',
    'Ficção Científica',
    'Mistério',
    'Romance',
    'Terror',
    'Comédia',
    'Drama Histórico'
  ];

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) { }

  async createStoryPrompt(
    genres: string[] | undefined,
    wordLimit: number | undefined,
    userWriting?: string, // Opcional: O que o usuário quer
    storyId?: string  //Opcional: Contexto da história
  ): Promise<string> {

    let finalGenres: string[];

    if (genres && genres.length > 0) {
      finalGenres = genres;
    } else {
      const randomIndex = Math.floor(Math.random() * this.DEFAULT_GENRES_POOL.length);
      finalGenres = [this.DEFAULT_GENRES_POOL[randomIndex]];
    }

    const finalWordLimit = wordLimit || 200;

    let contextPromptSection = "CONTEXTO: Nenhum. Esta é uma nova história.";

    if (storyId) {
      const story = await this.storyModel.findById(storyId).select('summary').exec();
      if (!story) {
        throw new NotFoundException(`História com ID ${storyId} não encontrada`);
      }
      contextPromptSection = `CONTEXTO (O QUE ACONTECEU ATÉ AGORA): "${story.summary}"`;
    }

    const genresString = finalGenres.join(', ');

    let userWritingPromptSection = "INSTRUÇÃO DO USUÁRIO: Nenhuma. Use sua criatividade.";
    if (userWriting && userWriting.trim() !== "") {
      userWritingPromptSection = `INSTRUÇÃO DO USUÁRIO (O QUE DEVE ACONTECER): "${userWriting}"`;
    }

    const prompt = `
      Você é um assistente de escrita criativa

      GÊNEROS: ${genresString}
      ${contextPromptSection}
      ${userWritingPromptSection}

      TAREFA:
      1. Crie um trecho de história que combine o "CONTEXTO" com a "INSTRUÇÃO DO USUÁRIO".
      2. Mantenha-se fiel aos GÊNEROS: ${genresString}.
      3. O 'textoCapitulo' deve ter aproximadamente ${finalWordLimit} palavras.
      4. Crie EXATAMENTE 4 'novasOpcoes' para o usuário.
      5. As 3 primeiras opções devem ser escolhas lógicas baseadas na história.
      6. A 4ª OPÇÃO (id: 4) DEVE SER UMA ESCOLHA "ALEATÓRIA" ou "SURPRESA" (ex: "Algo inesperado acontece", "Um meteoro cai", "Você encontra um item mágico").
      7. Não precisa retornar com a frase inicial "Aqui está sua história...", pode ir direto ao ponto

    FORMATO DE RESPOSTA OBRIGATÓRIO:
      A API está forçando uma resposta "application/json".
      Responda APENAS com um objeto JSON válido contendo:
      - "textoCapitulo": (string) O texto da história.
      - "novasOpcoes": (string[]) Um array com EXATAMENTE 4 strings de opção.
    `;

    return prompt;
  }
}