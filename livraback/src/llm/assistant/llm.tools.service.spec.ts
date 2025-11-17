import { Test, TestingModule } from '@nestjs/testing';
import { LlmToolsService } from './llm.tools.service';
import { getModelToken } from '@nestjs/mongoose';
import { Story } from '../../schemas/story.schema';
import { Comunidade } from 'src/comunidades/entities/comunidade.entity';
import { Readlist } from 'src/readlists/entities/readlist.entity';
import { Model, Types } from 'mongoose';
import { ComunidadesService } from 'src/comunidades/comunidades.service';
import { ReadlistsService } from 'src/readlists/readlists.service';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';

// --- Dados Falsos ---
const mockStory = {
  _id: 'story123',
  title: 'Minha História Teste',
  summary: 'Um resumo...',
};

const mockCommunity = {
  _id: 'comm123',
  nome: 'Comunidade Teste',
  membros: [new Types.ObjectId().toHexString()],
};

const mockReadlist = {
  _id: 'readlist123',
  nome: 'Favoritos',
  criador: 'user123',
  livros: [],
};

// --- Mocks dos Models ---
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

// --- Mocks dos Services ---
const mockComunidadesService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findPopularPosts: jest.fn(),
  addMembro: jest.fn(),
  removeMembro: jest.fn(),
};

const mockReadlistsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  addLivro: jest.fn(),
  removeLivro: jest.fn(),
};

// Mock para o futuro 'LivrosService' (para a ferramenta mockada)
const mockLivrosService = {
  findByName: jest.fn(),
};

// --- Início dos Testes ---
describe('LlmToolsService', () => {
  let service: LlmToolsService;
  let storyModel: Model<Story>;
  let duckDuckGoSearch: DuckDuckGoSearch;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmToolsService,
        {
          provide: getModelToken(Story.name),
          useValue: mockStoryModel,
        },
        {
          provide: ComunidadesService,
          useValue: mockComunidadesService,
        },
        {
          provide: ReadlistsService,
          useValue: mockReadlistsService,
        },
        {
          provide: getModelToken(Comunidade.name),
          useValue: {},
        },
        {
          provide: getModelToken(Readlist.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LlmToolsService>(LlmToolsService);
    storyModel = module.get<Model<Story>>(getModelToken(Story.name));
    duckDuckGoSearch = module.get<DuckDuckGoSearch>(DuckDuckGoSearch);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Ferramentas de Story  ---
  describe('Story Tools', () => {
    it('createGetUserStoriesTool: should fetch user stories', async () => {
      const userId = 'user-test-id';
      mockStoryExec.mockResolvedValue([mockStory]);

      const tool = service.createGetUserStoriesTool(userId);
      const result = await tool.func({});

      expect(tool.name).toBe('get_user_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith({ userId });
      expect(mockStoryChain.select).toHaveBeenCalledWith('title summary');
      expect(mockStoryChain.limit).toHaveBeenCalledWith(50);
      expect(result).toBe(JSON.stringify([mockStory]));
    });

    it('createGetRecentStoriesTool: should fetch recent stories', async () => {
      const count = 3;
      mockStoryExec.mockResolvedValue([mockStory]);

      const tool = service.createGetRecentStoriesTool();
      const result = await tool.func({ count });

      expect(tool.name).toBe('get_recent_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith();
      expect(mockStoryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockStoryChain.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(JSON.stringify([mockStory]));
    });
  });

  // --- Testes de Ferramentas de Comunidade  ---
  describe('Community Tools (using ComunidadesService)', () => {
    it('createGetCommunitiesTool: should delegate to ComunidadesService.findOne', async () => {
      const communityName = 'Ficção Científica';
      mockComunidadesService.findOne.mockResolvedValue(mockCommunity);

      const tool = service.createGetCommunitiesTool();
      const result = await tool.func({ communityName });

      expect(mockComunidadesService.findOne).toHaveBeenCalledWith(communityName);
      expect(result).toBe(JSON.stringify(mockCommunity));
    });

    it('createJoinCommunityTool: should delegate to ComunidadesService.addMembro', async () => {
      const userId = 'user-123';
      const communityName = 'Ficção Científica';
      const successMsg = { message: 'Usuário adicionado' };
      mockComunidadesService.addMembro.mockResolvedValue(successMsg);

      const tool = service.createJoinCommunityTool(userId);
      const result = await tool.func({ communityName });

      expect(mockComunidadesService.addMembro).toHaveBeenCalledWith(userId, communityName);
      expect(result).toBe(JSON.stringify(successMsg));
    });

    it('createLeaveCommunityTool: should delegate to ComunidadesService.removeMembro', async () => {
      const userId = 'user-123';
      const communityName = 'Ficção Científica';
      const successMsg = { message: 'Usuário removido' };
      mockComunidadesService.removeMembro.mockResolvedValue(successMsg);

      const tool = service.createLeaveCommunityTool(userId);
      const result = await tool.func({ communityName });

      expect(mockComunidadesService.removeMembro).toHaveBeenCalledWith(userId, communityName);
      expect(result).toBe(JSON.stringify(successMsg));
    });

    it('createGetPopularPostsCommunityTool: should delegate to ComunidadesService.findPopularPosts', async () => {
      const communityName = 'Ficção Científica';
      const count = 5;
      mockComunidadesService.findPopularPosts.mockResolvedValue([mockStory]);

      const tool = service.createGetPopularPostsInCommunityTool();
      const result = await tool.func({ communityName, count });

      expect(mockComunidadesService.findPopularPosts).toHaveBeenCalledWith(communityName, count);
      expect(result).toBe(JSON.stringify([mockStory]));
    });
  });

  // --- Testes de Ferramentas de Readlist ---
  describe('Readlist Tools (using ReadlistsService)', () => {
    const userId = 'user-123';
    const readlistId = 'readlist-abc';
    const readlistName = 'Favoritos';
    const livroId = 'livro-xyz';

    it('createFindReadlistByNameTool: should find a readlist by name', async () => {
      const mockReadlists = [
        { nome: 'Outra Lista', _id: 'errado' },
        { nome: 'Favoritos', _id: readlistId },
      ];
      mockReadlistsService.findAll.mockResolvedValue(mockReadlists);

      const tool = service.createFindReadlistByNameTool(userId);
      const result = await tool.func({ readlistName });

      expect(mockReadlistsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toBe(JSON.stringify({ id: readlistId, nome: readlistName }));
    });

    it('createAddBookToReadlistTool: should delegate to ReadlistsService.addLivro', async () => {
      mockReadlistsService.addLivro.mockResolvedValue(mockReadlist);

      const tool = service.createAddBookToReadlistTool(userId);
      const result = await tool.func({ readlistId, livroId });

      expect(mockReadlistsService.addLivro).toHaveBeenCalledWith(userId, readlistId, livroId);
      expect(result).toContain('adicionado com sucesso');
    });

    it('createRemoveBookFromReadlistTool: should delegate to ReadlistsService.removeLivro', async () => {
      mockReadlistsService.removeLivro.mockResolvedValue(mockReadlist);

      const tool = service.createRemoveBookFromReadlistTool(userId);
      const result = await tool.func({ readlistId, livroId });

      expect(mockReadlistsService.removeLivro).toHaveBeenCalledWith(userId, readlistId, livroId);
      expect(result).toContain('removido com sucesso');
    });

    it('createCreateReadlistTool: should delegate to ReadlistsService.create', async () => {
      const dto = { nome: 'Nova Lista', descricao: 'Desc', publica: false };
      mockReadlistsService.create.mockResolvedValue({ _id: 'novo-id', ...dto });

      const tool = service.createCreateReadlistTool(userId);
      const result = await tool.func(dto);

      expect(mockReadlistsService.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toContain('criada com sucesso');
    });

    it('createDeleteReadlistTool: should delegate to ReadlistsService.remove', async () => {
      mockReadlistsService.remove.mockResolvedValue({ deletedCount: 1 });

      const tool = service.createDeleteReadlistTool(userId);
      const result = await tool.func({ readlistId });

      expect(mockReadlistsService.remove).toHaveBeenCalledWith(userId, readlistId);
      expect(result).toContain('deletada com sucesso');
    });

    // --- Teste da Ferramenta de Busca Externa ---
    describe('DuckDuckGoSearch Tool', () => {
      it('should perform a search using DuckDuckGoSearch tool', async () => {
        const pergunta = 'O que é NestJS?';
        const mockSearchResults = [
          { title: 'NestJS - Node.js Framework', link: 'https://nestjs.com', snippet: 'NestJS é um framework...' },
        ];
        jest.spyOn(duckDuckGoSearch, 'call').mockResolvedValue(mockSearchResults);
        const result = await duckDuckGoSearch.call({ input: pergunta });

        expect(duckDuckGoSearch.call).toHaveBeenCalledWith({ input: pergunta });
        expect(result).toBe(mockSearchResults);
      });
    });
  });
});