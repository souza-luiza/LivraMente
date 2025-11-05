import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { LlmResponseDTO } from './dto/llm-response.dto';
import { LlmStoryService } from './llm.story.service';

const mockStoryService = {
  generateAndSaveStory: jest.fn(),
};

describe('LlmController', () => {
  let controller: LlmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [
        { provide: LlmStoryService, useValue: mockStoryService },
      ],
    }).compile();

    controller = module.get<LlmController>(LlmController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('gerarTexto', () => {
    it('should call the story service and return its response', async () => {
      const dto: GenerateTextDTO = {
        userWriting: 'um dragão ataca',
      };

      const mockResponse: LlmResponseDTO = {
        storyId: 'novo-id-do-banco-123',
        textoCapitulo: 'O dragão sobrevoou a vila...',
        novasOpcoes: [{ id: 1, texto: 'Correr' }],
      };

      mockStoryService.generateAndSaveStory.mockResolvedValue(mockResponse);

      const result = await controller.gerarTexto(dto);

      expect(result).toEqual(mockResponse);
      expect(mockStoryService.generateAndSaveStory).toHaveBeenCalledTimes(1);
      expect(mockStoryService.generateAndSaveStory).toHaveBeenCalledWith(dto);
    });
  });
});