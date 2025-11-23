import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { GenerateTextDTO } from './writer/dto/generate-text.dto';
import { LlmResponseDTO } from './writer/dto/llm-response.dto';
import { LlmStoryService } from './writer/llm-story.service';
import { AgentInputDto } from './assistant/dto/agent-input.dto';
import { LlmAgentService } from './assistant/llm-agent.service';

const mockStoryService = {
  generateAndSaveStory: jest.fn(),
};

describe('LlmController', () => {
  let controller: LlmController;
  let storyService: LlmStoryService;
  let agentService: LlmAgentService;

  const mockStoryService = {
    generateAndSaveStory: jest.fn(),
  };

  const mockAgentService = {
    runAnalysisAgent: jest.fn(),
  };

  const mockUser = { userId: 'user-123', email: 'teste@test.com', username: 'teste' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [
        { provide: LlmStoryService, useValue: mockStoryService },
        { provide: LlmAgentService, useValue: mockAgentService },
      ],
    }).compile();

    controller = module.get<LlmController>(LlmController);
    storyService = module.get<LlmStoryService>(LlmStoryService);
    agentService = module.get<LlmAgentService>(LlmAgentService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('gerarTexto', () => {
    it('deve chamar storyService.generateAndSaveStory', async () => {
      const dto: GenerateTextDTO = { userWriting: 'Era uma vez...' };
      mockStoryService.generateAndSaveStory.mockResolvedValue('História gerada');

      const result = await controller.gerarTexto(dto);

      expect(storyService.generateAndSaveStory).toHaveBeenCalledWith(dto);
      expect(result).toBe('História gerada');
    });
  });

  describe('PromptAnalise', () => {
    it('deve retornar a resposta do agentService.runAnalysisAgent', async () => {
      const dto: AgentInputDto = { userPrompt: 'Analise minhas histórias.' };
      const expectedResponse = 'Análise completa das suas histórias.';

      mockAgentService.runAnalysisAgent.mockResolvedValue(expectedResponse);
      const result = await controller.PromptAnalise(dto, mockUser as any);

      expect(agentService.runAnalysisAgent).toHaveBeenCalledWith(dto.userPrompt, mockUser.userId);
      expect(result).toEqual({ response: expectedResponse });
    });
  });
});