import { Test, TestingModule } from '@nestjs/testing';
import { LlmPromptService } from './llm-prompt.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { NotFoundException } from '@nestjs/common';

const mockStory = {
  _id: 's1',
  summary: 'O herói está na taverna.',
};
const mockGenres = ['Fantasia', 'Comédia'];
const mockUserWriting = 'O herói pede uma bebida.';
const mockWordLimit = 200;

const mockStoryModel = {
  findById: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

describe('LlmPromptService', () => {
  let service: LlmPromptService;
  let model: Model<StoryDocument>;
  let mockMathRandom: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmPromptService,
        {
          provide: getModelToken(Story.name),
          useValue: mockStoryModel,
        },
      ],
    }).compile();

    mockMathRandom = jest.spyOn(Math, 'random').mockImplementation(() => 0);
    service = module.get<LlmPromptService>(LlmPromptService);
    model = module.get<Model<StoryDocument>>(getModelToken(Story.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockMathRandom.mockRestore();
  });

  it('should build a simplified prompt for JSON string array', async () => {
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, mockUserWriting, undefined
    );

    expect(prompt).not.toContain('{ "id": 1, "texto": ... }');
    expect(prompt).toContain("O 'textoCapitulo' deve ter aproximadamente 200 palavras.");
    expect(prompt).toContain('- "textoCapitulo": (string) O texto da história.');
    expect(prompt).toContain('- "novasOpcoes": (string[]) Um array com EXATAMENTE 4 strings.');
  });

  it('should build prompt WITH context', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(mockStory);
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, mockUserWriting, 's1'
    );
    expect(model.findById).toHaveBeenCalledWith('s1');
    expect(prompt).toContain(mockStory.summary);
  });

  it('should build prompt WITHOUT context', async () => {
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, mockUserWriting, undefined
    );
    expect(model.findById).not.toHaveBeenCalled();
    expect(prompt).toContain('CONTEXTO: Nenhum. Esta é uma nova história.');
  });

  it('should throw NotFoundException if storyId is given but not found', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(null);
    await expect(
      service.createStoryPrompt(mockGenres, mockWordLimit, mockUserWriting, 'id_falsa'),
    ).rejects.toThrow(NotFoundException);
  });

  describe('Default Value Logic', () => {
    it('should use default random genre and default word limit', async () => {
      mockMathRandom.mockReturnValue(0);
      const prompt = await service.createStoryPrompt(
        undefined, undefined, 'um novo herói', undefined
      );
      expect(prompt).toContain('GÊNEROS: Fantasia');
      expect(prompt).toContain('aproximadamente 200 palavras');
    });
  });
});