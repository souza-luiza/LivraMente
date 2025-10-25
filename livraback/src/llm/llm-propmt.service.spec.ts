import { Test, TestingModule } from '@nestjs/testing';
import { LlmPromptService } from './llm-prompt.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';
import { NotFoundException } from '@nestjs/common';

const mockStory = {
  _id: 's1',
  summary: 'Este é o contexto da história vindo do banco.',
};
const mockGenre = 'Fantasia';
const mockUserWriting = 'O herói encontra um dragão adormecido.';
const mockWordLimit = 200;

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

  // Teste 1: Caminho Feliz
  it('should build the prompt correctly with all data', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(mockStory);

    const prompt = await service.createStoryPrompt(
      's1',
      mockGenre,
      mockUserWriting,
      mockWordLimit,
    );

    expect(model.findById).toHaveBeenCalledWith('s1');
    expect((model as any).select).toHaveBeenCalledWith('summary');
    expect((model as any).exec).toHaveBeenCalledTimes(1);

    expect(prompt).toContain(mockStory.summary);
    expect(prompt).toContain(mockGenre);
    expect(prompt).toContain(mockUserWriting);
    expect(prompt).toContain(`${mockWordLimit} palavras`);
    expect(prompt).toContain('textoCapitulo');
  });

it('should throw NotFoundException if the story is not found', async () => {
    ((model as any).exec as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createStoryPrompt('id_falsa', mockGenre, mockUserWriting, mockWordLimit),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.createStoryPrompt('id_falsa', mockGenre, mockUserWriting, mockWordLimit),
    ).rejects.toThrow('História com ID id_falsa não encontrada');
  });
});