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

  // Teste 1: Com 'userWriting' / Com Contexto
  it('should build prompt WITH userWriting and WITH context', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(mockStory);
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, mockUserWriting, 's1'
    );

    expect(model.findById).toHaveBeenCalledWith('s1');
    expect(prompt).toContain(mockStory.summary);
    expect(prompt).toContain(mockUserWriting);
    expect(prompt).toContain('INSTRUÇÃO DO USUÁRIO (O QUE DEVE ACONTECER)');
  });

  // Teste 2: Com 'userWriting' / Sem Contexto
  it('should build prompt WITH userWriting and WITHOUT context', async () => {
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, mockUserWriting, undefined
    );

    expect(model.findById).not.toHaveBeenCalled();
    expect(prompt).toContain('CONTEXTO: Nenhum. Esta é uma nova história.');
    expect(prompt).toContain(mockUserWriting);
    expect(prompt).toContain('INSTRUÇÃO DO USUÁRIO (O QUE DEVE ACONTECER)');
  });

  // Teste 3: Sem 'userWriting' / Com Contexto
  it('should build prompt WITHOUT userWriting and WITH context', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(mockStory);
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, undefined, 's1'
    );

    expect(model.findById).toHaveBeenCalledWith('s1');
    expect(prompt).toContain(mockStory.summary);
    expect(prompt).toContain('INSTRUÇÃO DO USUÁRIO: Nenhuma. Use sua criatividade.');
  });

  // Teste 4: Sem 'userWriting' / Sem Contexto
  it('should build prompt WITHOUT userWriting and WITHOUT context', async () => {
    const prompt = await service.createStoryPrompt(
      mockGenres, mockWordLimit, undefined, undefined
    );

    expect(model.findById).not.toHaveBeenCalled();
    expect(prompt).toContain('CONTEXTO: Nenhum. Esta é uma nova história.');
    expect(prompt).toContain('INSTRUÇÃO DO USUÁRIO: Nenhuma. Use sua criatividade.');
  });

  // Teste 5: CASO DE ERRO
  it('should throw NotFoundException if storyId is given but not found', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createStoryPrompt(mockGenres, mockWordLimit, mockUserWriting, 'id_falsa'),
    ).rejects.toThrow(NotFoundException);
  });
});