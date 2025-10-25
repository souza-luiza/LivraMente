import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';

@Injectable()
export class LlmPromptService {

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) { }

  async createStoryPrompt(
    genres: string[],
    wordLimit: number,
    userWriting?: string, // Opcional: O que o usuário quer
    storyId?: string  //Opcional: Contexto da história
  ): Promise<string> {

    let contextPromptSection = "CONTEXTO: Nenhum. Esta é uma nova história.";

    if (storyId) {
      const story = await this.storyModel.findById(storyId).select('summary').exec();
      if (!story) {
        throw new NotFoundException(`História com ID ${storyId} não encontrada`);
      }
      contextPromptSection = `
      CONTEXTO (O QUE ACONTECEU ATÉ AGORA): 
      "${story.summary}"
      `;
    }

    const genresString = genres.join(', ');

    let userWritingPromptSection = "INSTRUÇÃO DO USUÁRIO: Nenhuma. Use sua criatividade.";
    if (userWriting && userWriting.trim() !== "") {
      userWritingPromptSection = `
      INSTRUÇÃO DO USUÁRIO (O QUE DEVE ACONTECER):
      "${userWriting}"
      `;
    }

    const jsonFormatExample = ` 
    {
      "textoCapitulo": "O texto do próximo capítulo...",
      "novasOpcoes": [
        { "id": 1, "texto": "Texto da primeira opção de escolha" },
        { "id": 2, "texto": "Texto da segunda opção de escolha" },
        { "id": 3, "texto": "Texto da terceira opção de escolha" },
        { "id": 4, "texto": "Texto da opção aleatória/surpresa" }
      ]
    }
    `;

    const prompt = `
      Você é um assistente de escrita criativa

      GÊNEROS: ${genresString}
      ${contextPromptSection}
      ${userWritingPromptSection}
      
      TAREFA:
      1. Crie um trecho de história que combine o "CONTEXTO" com a "INSTRUÇÃO DO USUÁRIO".
      2. Mantenha-se fiel aos GÊNEROS: ${genresString}.
      3. O 'textoCapitulo' deve ter aproximadamente ${wordLimit} palavras.
      4. Crie EXATAMENTE 4 'novasOpcoes' para o usuário.
      5. As 3 primeiras opções devem ser escolhas lógicas baseadas na história.
      6. A 4ª OPÇÃO (id: 4) DEVE SER UMA ESCOLHA "ALEATÓRIA" ou "SURPRESA" (ex: "Algo inesperado acontece", "Um meteoro cai", "Você encontra um item mágico").
      
      FORMATO DE RESPOSTA OBRIGATÓRIO:
      Responda APENAS com um objeto JSON válido, seguindo EXATAMENTE este formato:
      ${jsonFormatExample}
    `;

    return prompt;
  }
}