import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema'; 

@Injectable()
export class LlmPromptService {

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) {}

  async createStoryPrompt(
    storyId: string, 
    genre: string,
    lastUserChoice: string
  ): Promise<string> {

    const story = await this.storyModel.findById(storyId).select('summary').exec();
    if (!story) {
      throw new NotFoundException(`História com ID ${storyId} não encontrada`);
    }

    const context = story.summary;
    const wordLimit = 200;

    // Define o formato de resposta 
    const jsonFormatExample = ` 
    {
      "textoCapitulo": "O texto do próximo capítulo deve vir aqui...",
      "novasOpcoes": [
        { "id": 1, "texto": "Texto da primeira opção de escolha" },
        { "id": 2, "texto": "Texto da segunda opção de escolha" },
        { "id": 3, "texto": "Texto da terceira opção de escolha" },
        { "id": 4, "texto": "Texto da quarta opção de escolha" }
      ]
    }
    `;

    // Monta a string final do prompt
    const prompt = `
      Você é um assistente de escrita criativa.
      
      GÊNERO: ${genre}
      CONTEXTO: ${context}
      ÚLTIMA ESCOLHA DO USUÁRIO: ${lastUserChoice}
      
       INSTRUÇÕES DA TAREFA:
      1. Continue a história a partir da "ÚLTIMA AÇÃO DO JOGADOR".
      2. Mantenha-se fiel ao GÊNERO: ${genre}.
      3. O novo trecho da história deve ter aproximadamente ${wordLimit} palavras.
      4. Ao final do trecho, crie EXATAMENTE 4 novas opções de escolha para o jogador.

      FORMATO DE RESPOSTA OBRIGATÓRIO:
      Sua resposta deve ser APENAS um objeto JSON válido, sem nenhum outro texto, explicação ou formatação (como \`\`\`json).
      Use exatamente a seguinte estrutura:
      ${jsonFormatExample}
    `;


    return prompt;
  }
}