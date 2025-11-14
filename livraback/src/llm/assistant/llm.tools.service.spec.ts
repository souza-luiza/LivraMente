import { Test, TestingModule } from '@nestjs/testing';
import { LlmToolsService } from './llm.tools.service';
import { getModelToken } from '@nestjs/mongoose';
import { Story } from '../../schemas/story.schema';
import { Comunidade } from 'src/comunidades/entities/comunidade.entity';
import { Model, Types } from 'mongoose';
import { DynamicStructuredTool } from '@langchain/core/tools';

// --- Dados Falsos para os Testes ---
const mockStory = {
  _id: 'story123',
  title: 'Minha História Teste',
  summary: 'Um resumo...',
};

const mockCommunity = {
  _id: 'comm123',
  nome: 'Comunidade Teste',
  membros: [new Types.ObjectId().toHexString()], // Use um ID válido
};

// --- Mocks dos Models do Mongoose ---

// Mock para StoryModel
// Criamos "stubs" (funções falsas) para os métodos que usamos
const mockStoryExec = jest.fn();
const mockStoryChain = {
  select: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: mockStoryExec,
};
const mockStoryModel = {
  find: jest.fn(() => mockStoryChain),
};

// Mock para CommunityModel
const mockCommunityExec = jest.fn();
const mockCommunityChain = {
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: mockCommunityExec,
};
const mockCommunityModel = {
  find: jest.fn(() => mockCommunityChain),
  findById: jest.fn(() => ({ exec: mockCommunityExec })),
  findByIdAndUpdate: jest.fn(() => ({ exec: mockCommunityExec })),
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
          useValue: mockStoryModel,
        },
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockCommunityModel,
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

      mockStoryExec.mockResolvedValue(stories);

      const tool = service.createGetUserStoriesTool(userId);
      const result = await tool.func({}); // Ferramenta sem args

      expect(tool.name).toBe('get_user_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith({ userId });
      expect(mockStoryChain.select).toHaveBeenCalledWith('title summary');
      expect(mockStoryChain.limit).toHaveBeenCalledWith(50);
      expect(result).toBe(JSON.stringify(stories));
    });

    it('should handle errors when fetching user stories', async () => {
      const userId = 'user-test-id';
      const errorMessage = 'Database error';

      mockStoryExec.mockRejectedValue(new Error(errorMessage));

      const tool = service.createGetUserStoriesTool(userId);
      const result = await tool.func({});

      expect(result).toBe(`Erro ao buscar histórias: ${errorMessage}`);
    });
  });

  // --- Teste para createGetPopularCommunitiesTool (Correto) ---
  describe('createGetPopularCommunitiesTool', () => {
    it('should fetch popular communities with a dynamic count', async () => {
      const communities = [mockCommunity];
      const dynamicCount = 10;

      mockCommunityExec.mockResolvedValue(communities);

      const tool = service.createGetPopularCommunitiesTool();
      const result = await tool.func({ count: dynamicCount });

      expect(tool.name).toBe('get_popular_communities');
      expect(mockCommunityModel.find).toHaveBeenCalledWith();
      expect(mockCommunityChain.sort).toHaveBeenCalledWith({ members: -1 });
      expect(mockCommunityChain.limit).toHaveBeenCalledWith(dynamicCount);
      expect(result).toBe(JSON.stringify(communities));
    });

    it('should handle errors when fetching communities', async () => {
      const errorMessage = 'DB failed';

      mockCommunityExec.mockRejectedValue(new Error(errorMessage));

      const tool = service.createGetPopularCommunitiesTool();
      const result = await tool.func({ count: 5 });

      expect(result).toBe(`Erro ao buscar comunidades: ${errorMessage}`);
    });
  });

  // --- Teste para createGetRecentStoriesTool ---
  describe('createGetRecentStoriesTool', () => {
    it('should fetch recent stories with a dynamic count', async () => {
      const stories = [mockStory];
      const dynamicCount = 7;

      mockStoryExec.mockResolvedValue(stories);

      const tool = service.createGetRecentStoriesTool();
      const result = await tool.func({ count: dynamicCount });

      expect(tool.name).toBe('get_recent_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith();
      expect(mockStoryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockStoryChain.limit).toHaveBeenCalledWith(dynamicCount);
      expect(result).toBe(JSON.stringify(stories));
    });
  });

  // --- Teste para createGetCommunitiesTool ---
  describe('createGetCommunitiesTool', () => {
    it('should find and return a specific community', async () => {
      const communityId = 'comm123';

      mockCommunityExec.mockResolvedValue(mockCommunity);

      const tool = service.createGetCommunitiesTool();
      const result = await tool.func({ communityId });

      expect(tool.name).toBe('get_community');
      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(result).toBe(JSON.stringify(mockCommunity));
    });

    it('should return error if community not found', async () => {
      const communityId = 'comm-nao-existe';

      mockCommunityExec.mockResolvedValue(null); // Simula não encontrar

      const tool = service.createGetCommunitiesTool();
      const result = await tool.func({ communityId });

      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(result).toBe(`Comunidade não encontrada: ${communityId}`);
    });
  });

  // --- Teste para createJoinCommunityTool ---
  describe('createJoinCommunityTool', () => {
    const userId = 'user-join-id';
    const communityId = 'comm-join-id';

    it('should allow a user to join a community', async () => {
      const updatedCommunity = { ...mockCommunity, members: [userId] };

      mockCommunityExec.mockResolvedValueOnce(mockCommunity);
      mockCommunityExec.mockResolvedValueOnce(updatedCommunity);

      const tool = service.createJoinCommunityTool();
      const result = await tool.func({ communityId, userId });

      expect(tool.name).toBe('join_community');
      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockCommunityModel.findByIdAndUpdate).toHaveBeenCalledWith(
        communityId,
        { $addToSet: { members: userId } },
        { new: true },
      );
      expect(result).toBe(JSON.stringify(updatedCommunity));
    });

    it('should handle non-existent community when joining', async () => {
      mockCommunityExec.mockResolvedValue(null); // findById retorna null

      const tool = service.createJoinCommunityTool();
      const result = await tool.func({ communityId, userId });

      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockCommunityModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result).toBe(`Comunidade não encontrada: ${communityId}`);
    });
  });

  // --- Teste para createLeaveCommunityTool ---
  describe('createLeaveCommunityTool', () => {
    const userId = 'user-leave-id';
    const communityId = 'comm-leave-id';

    it('should allow a user to leave a community', async () => {
      const communityMock = { ...mockCommunity, members: [userId as any] };
      const updatedCommunityMock = { ...mockCommunity, members: [] };

      mockCommunityExec.mockResolvedValueOnce(communityMock);
      mockCommunityExec.mockResolvedValueOnce(updatedCommunityMock);

      const tool = service.createLeaveCommunityTool(userId);
      const result = await tool.func({ communityId });

      expect(tool.name).toBe('leave_community');
      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockCommunityModel.findByIdAndUpdate).toHaveBeenCalledWith(
        communityId,
        { $pull: { members: userId } },
        { new: true },
      );
      expect(result).toBe(JSON.stringify(updatedCommunityMock));
    });

    it('should handle user not being a member when leaving', async () => {
      const communityMock = { ...mockCommunity, members: [] }; // Usuário não é membro

      mockCommunityExec.mockResolvedValue(communityMock);

      const tool = service.createLeaveCommunityTool(userId);
      const result = await tool.func({ communityId });

      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockCommunityModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result).toBe(
        `User ${userId} is not a member of community ${communityId}`,
      );
    });
  });

  // --- Teste para createGetPopularPostsCommunityTool ---
  describe('createGetPopularPostsCommunityTool', () => {
    it('should fetch popular posts for a specific community', async () => {
      const communityId = 'comm123';
      const count = 5;

      mockCommunityExec.mockResolvedValue(mockCommunity); // findById (comunidade)
      mockStoryExec.mockResolvedValue([mockStory]); // find (posts)

      const tool = service.createGetPopularPostsCommunityTool();
      const result = await tool.func({ communityId, count });

      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockStoryModel.find).toHaveBeenCalledWith({ communityId });
      expect(mockStoryChain.sort).toHaveBeenCalledWith({
        likes: -1,
        views: -1,
        createdAt: -1,
      });
      expect(mockStoryChain.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(JSON.stringify([mockStory]));
    });

    it('should fetch popular posts from the whole site if no communityId', async () => {
      const count = 10; // Default

      mockStoryExec.mockResolvedValue([mockStory]); // find (posts)

      const tool = service.createGetPopularPostsCommunityTool();
      const result = await tool.func({ count }); // Sem communityId

      expect(mockCommunityModel.findById).not.toHaveBeenCalled(); // Não deve procurar comunidade
      expect(mockStoryModel.find).toHaveBeenCalledWith({}); // Query vazia
      expect(mockStoryChain.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(JSON.stringify([mockStory]));
    });

    it('should return error if communityId is provided but not found', async () => {
      const communityId = 'comm-nao-existe';

      mockCommunityExec.mockResolvedValue(null); // findById falha

      const tool = service.createGetPopularPostsCommunityTool();
      const result = await tool.func({ communityId, count: 5 });

      expect(mockCommunityModel.findById).toHaveBeenCalledWith(communityId);
      expect(mockStoryModel.find).not.toHaveBeenCalled();
      expect(result).toBe(`Comunidade não encontrada: ${communityId}`);
    });
  });
});