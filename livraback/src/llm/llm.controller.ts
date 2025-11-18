import { Controller, Post, Body, ValidationPipe, UsePipes, UseGuards, Req } from '@nestjs/common';
import { GenerateTextDTO } from './writer/dto/generate-text.dto';
import { LlmResponseDTO } from './writer/dto/llm-response.dto';
import { LlmStoryService } from './writer/llm.story.service';
import { LlmAgentService } from './assistant/llm.agent.service';
import { AgentInputDto } from './assistant/dto/agent-input.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@Controller('llm')
export class LlmController {

  constructor(
    private readonly storyService: LlmStoryService,
    private readonly agentService: LlmAgentService,
  ) { }

  // Endpoint para gerar texto (histórias)
  @Post('gerar')
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe())
  async gerarTexto(@Body() generateTextDto: GenerateTextDTO): Promise<LlmResponseDTO> {
    return this.storyService.generateAndSaveStory(generateTextDto);
  }

  // Endpoint para o agente de análise
  @Post('analisar')
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe())
  async PromptAnalise(
    @Body() agentInputDto: AgentInputDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ response: string }> {

    const agentResponse = await this.agentService.runAnalysisAgent(
      agentInputDto.userPrompt,
      user.userId,
    );

    return { response: agentResponse };
  }
}