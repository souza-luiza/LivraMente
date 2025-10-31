import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { LlmPromptService } from './llm.prompt.service';
import { LlmApiService } from './llm.api.service';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmResponseDTO } from './dto/llm-response.dto';

@Controller('llm')
export class LlmController {

  constructor(
    private readonly promptService: LlmPromptService,
    private readonly apiService: LlmApiService,
  ) { }

  @Post('gerar')
  @UsePipes(new ValidationPipe())
  async gerarTexto(@Body() generateTextDto: GenerateTextDTO): Promise<LlmResponseDTO> {

    const prompt = await this.promptService.createStoryPrompt(
      generateTextDto.genres,
      generateTextDto.wordLimit,
      generateTextDto.userWriting,
      generateTextDto.storyId,
    );

    const validatedResponse = await this.apiService.generateContent(prompt);

    return validatedResponse;
  }
}