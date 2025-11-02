import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmResponseDTO } from './dto/llm-response.dto';
import { LlmStoryService } from './llm.story.service';

@Controller('llm')
export class LlmController {

  constructor(
    private readonly storyService: LlmStoryService,
  ) { }

  @Post('gerar')
  @UsePipes(new ValidationPipe())
    async gerarTexto(@Body() generateTextDto: GenerateTextDTO): Promise<LlmResponseDTO> {
      return this.storyService.generateAndSaveStory(generateTextDto);
    }
}