import { Test, TestingModule } from '@nestjs/testing';
import { LlmStoryService } from './llm.story.service';
import { LlmPromptService } from './llm.prompt.service';
import { LlmApiService } from './llm.api.service';
import { getModelToken } from '@nestjs/mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';
import { GenerateTextDTO } from './dto/generate-text.dto';
import { NotFoundException } from '@nestjs/common';

const mockPromptService = {
  createStoryPrompt: jest.fn(),
};

const mockApiService = {
  generateContent: jest.fn(),
};

const mockSave = jest.fn();
const mockExec = jest.fn();

const mockStoryModel = jest.fn().mockImplementation(() => ({
  save: mockSave,
}));

(mockStoryModel as any).findByIdAndUpdate= jest.fn(() => ({
  exec: mockExec,
}));

const mockAiResponse = {
  textoCapitulo: 'Era uma vez um capítulo...',
  novasOpcoes: [
    { id: 1, texto: 'opção 1' },
    { id: 2, texto: 'opção 2' },
    { id: 3, texto: 'opção 3' },
    { id: 4, texto: 'opção 4' },
  ],
};

const mockPrompt = 'Você é um assistente...';

describe('LlmStoryService', () => {
  let service: LlmStoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmStoryService,
        { provide: LlmPromptService, useValue: mockPromptService },
        { provide: LlmApiService, useValue: mockApiService },
        {
          provide: getModelToken(Story.name),
          useValue: mockStoryModel,
        },
      ],
    }).compile();

    service = module.get<LlmStoryService>(LlmStoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Cenário 1: Nova História (storyId é undefined)', () => {
    it('should create and save a new story', async () => {
      const dto: GenerateTextDTO = {
        userWriting: 'Uma nova história',
        genres: ['Fantasia'],
        wordLimit: 150,
        storyId: undefined,
      };

      const mockNewStoryId = 'new-mongo-id-123';
      
      mockPromptService.createStoryPrompt.mockResolvedValue(mockPrompt);
      mockApiService.generateContent.mockResolvedValue(mockAiResponse);
      mockSave.mockResolvedValue({
        _id: mockNewStoryId,
        summary: mockAiResponse.textoCapitulo,
      });

      const result = await service.generateAndSaveStory(dto);

      expect(mockPromptService.createStoryPrompt).toHaveBeenCalledWith(
        dto.genres, dto.wordLimit, dto.userWriting, undefined
      );
      expect(mockApiService.generateContent).toHaveBeenCalledWith(mockPrompt);
      
      expect(mockStoryModel).toHaveBeenCalledWith({ summary: mockAiResponse.textoCapitulo });
      expect(mockSave).toHaveBeenCalledTimes(1);
      
      expect((mockStoryModel as any).findByIdAndUpdate).not.toHaveBeenCalled();

      expect(result).toEqual({
        storyId: mockNewStoryId,
        textoCapitulo: mockAiResponse.textoCapitulo,
        novasOpcoes: mockAiResponse.novasOpcoes,
      });
    });
  });

  describe('Cenário 2: História Existente (storyId é fornecido)', () => {
    it('should find and update an existing story', async () => {
      const existingStoryId = 'existing-mongo-id-456';
      const dto: GenerateTextDTO = {
        userWriting: 'A continuação',
        storyId: existingStoryId,
      };
      
      mockPromptService.createStoryPrompt.mockResolvedValue(mockPrompt);
      mockApiService.generateContent.mockResolvedValue(mockAiResponse);
      mockExec.mockResolvedValue({
        _id: existingStoryId,
        summary: mockAiResponse.textoCapitulo,
      });

      const result = await service.generateAndSaveStory(dto);

      expect(mockPromptService.createStoryPrompt).toHaveBeenCalledWith(
        dto.genres, dto.wordLimit, dto.userWriting, existingStoryId
      );
      expect(mockApiService.generateContent).toHaveBeenCalledWith(mockPrompt);

      expect((mockStoryModel as any).findByIdAndUpdate).toHaveBeenCalledWith(
        existingStoryId,
        { $set: { summary: mockAiResponse.textoCapitulo } },
        { new: true }
      );
      expect(mockExec).toHaveBeenCalledTimes(1);

      expect(mockStoryModel).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();

      expect(result).toEqual({
        storyId: existingStoryId,
        textoCapitulo: mockAiResponse.textoCapitulo,
        novasOpcoes: mockAiResponse.novasOpcoes,
      });
    });
  });

  describe('Cenário 3: Erro (História não encontrada)', () => {
    it('should throw NotFoundException if storyId is invalid', async () => {
      // Arrange
      const invalidStoryId = 'id-falso-789';
      const dto: GenerateTextDTO = {
        userWriting: 'A continuação',
        storyId: invalidStoryId,
      };

      mockPromptService.createStoryPrompt.mockResolvedValue(mockPrompt);
      mockApiService.generateContent.mockResolvedValue(mockAiResponse);
      
      mockExec.mockResolvedValue(null);

      await expect(service.generateAndSaveStory(dto))
        .rejects.toThrow(NotFoundException);
        
      await expect(service.generateAndSaveStory(dto))
        .rejects.toThrow(`História com ID ${invalidStoryId} não encontrada.`);
    });
  });
});