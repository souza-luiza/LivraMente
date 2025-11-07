import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { GenerateTextDTO } from './writer/dto/generate-text.dto';
import { LlmResponseDTO } from './writer/dto/llm-response.dto';
import { LlmStoryService } from './writer/llm.story.service';

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