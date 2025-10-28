import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmPromptService } from './llm-prompt.service';
import { LlmResponseDTO } from './dto/llm-response.dto';
import { LlmApiService } from './llm.api.service';

const mockPromptService = {
  createStoryPrompt: jest.fn(),
};

const mockApiService = {
  generateContent: jest.fn(),
};

describe('LlmController', () => {
  let controller: LlmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [
        { provide: LlmPromptService, useValue: mockPromptService },
        { provide: LlmApiService, useValue: mockApiService },
      ],
    }).compile();


    controller = module.get<LlmController>(LlmController);

    // Limpa o histórico de chamadas dos mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('gerarTexto', () => {
    it('should orchestrate prompt creation and content generation', async () => {

      const dto: GenerateTextDTO = {
        genres: ['fantasy', 'adventure'],
        wordLimit: 150,
        userWriting: 'um dragão ataca',
        storyId: 'some-story-id',
      };

      const mockPrompt = 'Você é um assistente...';
      const mockResponse: LlmResponseDTO = {
        textoCapitulo: 'O dragão sobrevoou a vila...',
        novasOpcoes: [
          { id: 1, texto: 'Correr' },
          { id: 2, texto: 'Esconder' },
          { id: 3, texto: 'Atacar' },
          { id: 4, texto: 'Tentar conversar com ele' },
        ],
      };
      
      // Ensina os mocks a retornarem valores esperados
      mockPromptService.createStoryPrompt.mockResolvedValue(mockPrompt);
      mockApiService.generateContent.mockResolvedValue(mockResponse);

      const result = await controller.gerarTexto(dto);
      
      // Verifica se o resultado final é o que o ApiService retornou
      expect(result).toEqual(mockResponse);
      
      // Verifica se o PromptService foi chamado com os argumentos corretos do DTO
      expect(mockPromptService.createStoryPrompt).toHaveBeenCalledTimes(1);
      expect(mockPromptService.createStoryPrompt).toHaveBeenCalledWith(
        dto.genres,
        dto.wordLimit,
        dto.userWriting,
        dto.storyId,
      );

      // Verifica se o ApiService foi chamado com o prompt que o PromptService criou
      expect(mockApiService.generateContent).toHaveBeenCalledTimes(1);
      expect(mockApiService.generateContent).toHaveBeenCalledWith(mockPrompt);
    });
  });
});
