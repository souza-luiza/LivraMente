import { Test, TestingModule } from '@nestjs/testing';
import { LlmPromptService } from './llm-prompt.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';
import { NotFoundException } from '@nestjs/common';

const mockStory = {
  _id: 's1',
  summary: 'O herói está na taverna.',
};
const mockGenres = ['Fantasia', 'Comédia'];
const mockUserWriting = 'O herói pede uma bebida.';
const mockWordLimit = 150;

const mockStoryModel = {
  findById: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

describe('LlmPromptService', () => {
  let service: LlmPromptService;
  let model: Model<StoryDocument>;

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

    service = module.get<LlmPromptService>(LlmPromptService);
    model = module.get<Model<StoryDocument>>(getModelToken(Story.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste 1: Caminho Feliz (Com contexto e com instrução)
  it('should build prompt with context and user writing', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(mockStory);

    const prompt = await service.createStoryPrompt(
      mockGenres,
      mockWordLimit,
      mockUserWriting,
      's1', // Passando um storyId
    );

    expect(model.findById).toHaveBeenCalledWith('s1');
    expect(prompt).toContain(mockStory.summary);
    expect(prompt).toContain(mockGenres.join(', '));
    expect(prompt).toContain(mockUserWriting);
    expect(prompt).toContain(`${mockWordLimit} palavras`);
    expect(prompt).toContain('EXATAMENTE 4');
    expect(prompt).toContain('opção aleatória/surpresa');
  });

  // Teste 2: Caminho Feliz (Sem contexto, sem instrução)
  it('should build prompt without context or user writing', async () => {
    const prompt = await service.createStoryPrompt(
      mockGenres,
      mockWordLimit,
      undefined, // Sem user writing
      undefined, // Sem storyId
    );

    expect(model.findById).not.toHaveBeenCalled();

    // Verifica se os textos alternativos estão lá
    expect(prompt).toContain('CONTEXTO: Nenhum. Esta é uma nova história.');
    expect(prompt).toContain('INSTRUÇÃO DO USUÁRIO: Nenhuma. Use sua criatividade.');
    expect(prompt).toContain(mockGenres.join(', '));
  });

  // Teste 3: Caminho de Erro (ID inválido)
  it('should throw NotFoundException if story is not found', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createStoryPrompt(mockGenres, mockWordLimit, mockUserWriting, 'id_falsa'),
    ).rejects.toThrow(NotFoundException);
  });
});