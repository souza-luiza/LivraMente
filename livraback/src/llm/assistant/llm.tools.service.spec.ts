import { Test, TestingModule } from '@nestjs/testing';
import { LlmToolsService } from './llm.tools.service';
import { getModelToken } from '@nestjs/mongoose';
import { Story } from '../../schemas/story.schema';
import { Comunidade } from 'src/comunidades/entities/comunidade.entity';
import { Model } from 'mongoose';

// --- Dados Falsos para os Testes ---
const mockStory = {
  _id: 'story123',
  title: 'Minha História Teste',
  summary: 'Um resumo...',
};

const mockCommunity = {
  _id: 'comm123',
  nome: 'Comunidade Teste',
  membros: 100,
};

// --- Mock da Cadeia de Comandos do Mongoose ---
// Precisamos mockar a cadeia: .find().sort().limit().exec()

// Mock para StoryModel
const mockStoryChain = {
  select: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};
const mockStoryModel = {
  find: jest.fn(() => mockStoryChain),
};

// Mock para CommunityModel
const mockCommunityChain = {
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};
const mockCommunityModel = {
  find: jest.fn(() => mockCommunityChain),
};

// --- Início dos Testes ---
describe('LlmToolsService', () => {
  let service: LlmToolsService;
  let storyModel: Model<Story>;
  let communityModel: Model<Comunidade>;

  beforeEach(async () => {
    // 1. Compila o módulo de teste com os mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmToolsService,
        {
          provide: getModelToken(Story.name),
          useValue: mockStoryModel, // Usa o mock do StoryModel
        },
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockCommunityModel, // Usa o mock do CommunityModel
        },
      ],
    }).compile();

    service = module.get<LlmToolsService>(LlmToolsService);
    storyModel = module.get<Model<Story>>(getModelToken(Story.name));
    communityModel = module.get<Model<Comunidade>>(
      getModelToken(Comunidade.name),
    );

    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Teste para createGetUserStoriesTool ---
  describe('createGetUserStoriesTool', () => {
    it('should create a tool that fetches user stories', async () => {
      const userId = 'user-test-id';
      const stories = [mockStory];

      mockStoryChain.exec.mockResolvedValue(stories);

      const tool = service.createGetUserStoriesTool(userId);
   
      const result = await tool.func();

      expect(tool.name).toBe('get_user_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith({ userId });
      expect(mockStoryChain.select).toHaveBeenCalledWith('title summary');
      expect(mockStoryChain.limit).toHaveBeenCalledWith(50);
      expect(result).toBe(JSON.stringify(stories));
    });

    it('should handle errors when fetching user stories', async () => {
      const userId = 'user-test-id';
      const errorMessage = 'Database error';
      // Simula a falha do banco
      mockStoryChain.exec.mockRejectedValue(new Error(errorMessage));

      const tool = service.createGetUserStoriesTool(userId);
      const result = await tool.func();

      expect(result).toBe(`Erro ao buscar histórias: ${errorMessage}`);
    });
  });

  // --- Teste para createGetPopularCommunitiesTool ---
  describe('createGetPopularCommunitiesTool', () => {
    it('should fetch popular communities with a dynamic count', async () => {
      const communities = [mockCommunity];
      const dynamicCount = 10;
      mockCommunityChain.exec.mockResolvedValue(communities);

      const tool = service.createGetPopularCommunitiesTool();

      const result = await tool.func({ count: dynamicCount });

      expect(tool.name).toBe('get_popular_communities');
      expect(mockCommunityModel.find).toHaveBeenCalledWith();
      expect(mockCommunityChain.sort).toHaveBeenCalledWith({ members: -1 });
      expect(mockCommunityChain.limit).toHaveBeenCalledWith(dynamicCount); // Verifica o count dinâmico
      expect(result).toBe(JSON.stringify(communities));
    });

    it('should handle errors when fetching communities', async () => {
      const errorMessage = 'DB failed';
      mockCommunityChain.exec.mockRejectedValue(new Error(errorMessage));

      const tool = service.createGetPopularCommunitiesTool();
      const result = await tool.func({ count: 5 }); // O count não importa aqui

      expect(result).toBe(`Erro ao buscar comunidades: ${errorMessage}`);
    });
  });

  // --- Teste para createGetRecentStoriesTool ---
  describe('createGetRecentStoriesTool', () => {
    it('should fetch recent stories with a dynamic count', async () => {
      const stories = [mockStory];
      const dynamicCount = 7;
      mockStoryChain.exec.mockResolvedValue(stories);

      const tool = service.createGetRecentStoriesTool();
      const result = await tool.func({ count: dynamicCount });

      expect(tool.name).toBe('get_recent_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith();
      expect(mockStoryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockStoryChain.limit).toHaveBeenCalledWith(dynamicCount);
      expect(result).toBe(JSON.stringify(stories));
    });

    it('should simulate the default count of 3', async () => {
      const stories = [mockStory];
      const defaultCount = 3;
      mockStoryChain.exec.mockResolvedValue(stories);

      const tool = service.createGetRecentStoriesTool();

      const result = await tool.func({ count: defaultCount });

      expect(mockStoryChain.limit).toHaveBeenCalledWith(defaultCount);
      expect(result).toBe(JSON.stringify(stories));
    });
  });
});