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
    storyId: string,
    genre: string[],
    userWriting: string,
    wordLimit: number
  ): Promise<string> {

    const story = await this.storyModel.findById(storyId).select('summary').exec();
    if (!story) {
      throw new NotFoundException(`História com ID ${storyId} não encontrada`);
    }

    const context = story.summary; // "Contexto"

    const jsonFormatExample = ` 
    {
      "textoCapitulo": "O texto do próximo capítulo gerado pela IA..."
    }
    `;

    const prompt = `
      Você é um assistente de escrita criativa. Sua tarefa é continuar uma história.
      
      GÊNERO:  ${genre.join(', ')}
      
      CONTEXTO (O QUE ACONTECEU ATÉ AGORA): 
      "${context}"
      
      INSTRUÇÃO DO USUÁRIO (O QUE DEVE ACONTECER AGORA):
      "${userWriting}"
      
      TAREFA:
      1. Continue a história combinando o "CONTEXTO" com a "INSTRUÇÃO DO USUÁRIO".
      2. Mantenha-se fiel ao GÊNERO:  ${genre.join(', ')}.
      3. O novo trecho da história (textoCapitulo) deve ter aproximadamente ${wordLimit} palavras.
      
      FORMATO DE RESPOSTA OBRIGATÓRIO:
      Sua resposta deve ser APENAS um objeto JSON válido...
      Use exatamente a seguinte estrutura:
      ${jsonFormatExample}
    `;

    return prompt;
  }
}