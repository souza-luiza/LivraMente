import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';
import { LlmPromptService } from './llm.prompt.service';
import { LlmApiService } from './llm.api.service';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmResponseDTO, OpcaoDTO } from './dto/llm-response.dto';

@Injectable()
export class LlmStoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private readonly promptService: LlmPromptService,
    private readonly apiService: LlmApiService,
  ) {}

  async generateAndSaveStory(
    dto: GenerateTextDTO,
  ): Promise<LlmResponseDTO> {
    
    const prompt = await this.promptService.createStoryPrompt(
      dto.genres,
      dto.wordLimit,
      dto.userWriting,
      dto.storyId,
    );

    const aiResponse = await this.apiService.generateContent(prompt);

    const savedStory = await this.saveOrUpdateStory(
      dto.storyId,
      aiResponse.textoCapitulo,
      aiResponse.novasOpcoes,
    );

    if( !savedStory){
      throw new NotFoundException(`História com ID ${dto.storyId} não encontrada.`);
    }

    return {
      storyId: (savedStory as any)._id.toString(), // O ID da história (seja ela nova ou atualizada)
      textoCapitulo: aiResponse.textoCapitulo,
      novasOpcoes: aiResponse.novasOpcoes,
    };
  }

  private async saveOrUpdateStory(
    storyId: string | undefined,
    textoCapitulo: string,
    novasOpcoes: OpcaoDTO[],
  ): Promise<StoryDocument | null> {


    if (storyId) {
      return this.storyModel.findByIdAndUpdate( storyId,
          {
            $set: { summary: textoCapitulo }, 
          },
          { new: true }, // Retorna o documento atualizado
        )
        .exec();
    } else {
      const newStory = new this.storyModel({
        summary: textoCapitulo, 
      });
      return newStory.save();
    }
  }
}