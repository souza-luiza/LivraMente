import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { LlmPromptService } from './llm-prompt.service';
import { LlmApiService } from './llm-api.service';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmApiResponseDTO } from './dto/llm-api.response.dto';
import { LlmResponseDTO, OpcaoDTO } from './dto/llm-response.dto';

@Injectable()
export class LlmStoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private readonly promptService: LlmPromptService,
    private readonly apiService: LlmApiService,
  ) { }

  async generateAndSaveStory(
    dto: GenerateTextDTO,
  ): Promise<LlmResponseDTO> {

    const prompt = await this.promptService.createStoryPrompt(
      dto.genres,
      dto.wordLimit,
      dto.userWriting,
      dto.storyId,
    );

    const aiResponse: LlmApiResponseDTO = await this.apiService.generateContent(prompt);

    const novasOpcoesComId: OpcaoDTO[] = aiResponse.novasOpcoes.map((texto, index) => {
      return { id: index + 1, texto: texto };
    });

    const savedStory = await this.saveOrUpdateStory(
      dto,
      aiResponse.textoCapitulo,
      novasOpcoesComId,
    );

    if (!savedStory) {
      throw new NotFoundException(`História com ID ${dto.storyId} não encontrada.`);
    }

    return {
      storyId: (savedStory as any)._id.toString(),
      textoCapitulo: aiResponse.textoCapitulo,
      novasOpcoes: novasOpcoesComId,
    };
  }

  private async saveOrUpdateStory(
    dto: GenerateTextDTO,
    textoCapitulo: string,
    novasOpcoes: OpcaoDTO[],
  ): Promise<StoryDocument | null> {

    if (dto.storyId) {
      return this.storyModel.findByIdAndUpdate(dto.storyId,
        {
          $set: { summary: textoCapitulo },
        },
        { new: true },
      )
        .exec();
    } else {
      const newStory = new this.storyModel({
        summary: textoCapitulo, 
        title: dto.userWriting || 'Nova História',
      });
      return newStory.save();
    }
  }
}