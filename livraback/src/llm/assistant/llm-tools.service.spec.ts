import { Test, TestingModule } from '@nestjs/testing';
import { LlmToolsService } from './llm-tools.service';
import { getModelToken } from '@nestjs/mongoose';
import { Story } from '../../schemas/story.schema';
import { Comunidade } from 'src/comunidades/entities/comunidade.entity';
import { Readlist } from 'src/readlists/entities/readlist.entity';
import { User } from 'src/users/entities/user.entity';
import { Model, Types } from 'mongoose';
import { ComunidadesService } from 'src/comunidades/comunidades.service';
import { ReadlistsService } from 'src/readlists/readlists.service';
import { UsersService } from 'src/users/users.service';

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
  findAllPosts: jest.fn(),
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

const mockUsersService = {
  findOne: jest.fn(),
  findReadlistsFavoritas: jest.fn(),
  registroLeitura: jest.fn(),
};

// --- Início dos Testes ---
describe('LlmToolsService', () => {
  let service: LlmToolsService;
  let storyModel: Model<Story>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmToolsService,
        { provide: getModelToken(Story.name), useValue: mockStoryModel },
        { provide: ComunidadesService, useValue: mockComunidadesService },
        { provide: ReadlistsService, useValue: mockReadlistsService },
        { provide: UsersService, useValue: mockUsersService },
        // Mocks vazios para models não usados diretamente
        { provide: getModelToken(Comunidade.name), useValue: {} },
        { provide: getModelToken(Readlist.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: {} },
      ],
    }).compile();

    service = module.get<LlmToolsService>(LlmToolsService);
    storyModel = module.get<Model<Story>>(getModelToken(Story.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Ferramentas de Story ---
  describe('Story Tools', () => {
    it('createGetUserStoriesTool: should fetch user stories', async () => {
      const userId = 'user-test-id';
      mockStoryExec.mockResolvedValue([mockStory]);

      const tool = service.createGetUserStoriesTool(userId);
      const result = await tool.func({});

      expect(tool.name).toBe('get_user_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toBe(JSON.stringify([mockStory]));
    });

    it('createGetRecentStoriesTool: should fetch recent stories', async () => {
      const count = 3;
      mockStoryExec.mockResolvedValue([mockStory]);

      const tool = service.createGetRecentStoriesTool();
      const result = await tool.func({ count });

      expect(tool.name).toBe('get_recent_stories');
      expect(mockStoryModel.find).toHaveBeenCalledWith();
      expect(mockStoryChain.limit).toHaveBeenCalledWith(count);
      expect(result).toBe(JSON.stringify([mockStory]));
    });
  });

  // --- Testes de Ferramentas de Comunidade ---
  describe('Community Tools', () => {
    describe('createGetPopularCommunitiesTool', () => {
      it('deve buscar todas, ordenar por membros e retornar as top N', async () => {
        const count = 2;

        // 1. Criamos dados falsos com diferentes quantidades de membros
        const commPequena = { ...mockCommunity, nome: 'Pequena', membros: ['u1'] };           // 1 membro
        const commGrande = { ...mockCommunity, nome: 'Grande', membros: ['u1', 'u2', 'u3'] }; // 3 membros
        const commMedia = { ...mockCommunity, nome: 'Media', membros: ['u1', 'u2'] };         // 2 membros

        // 2. O service retorna tudo misturado
        mockComunidadesService.findAll.mockResolvedValue([commPequena, commGrande, commMedia]);

        const tool = service.createGetPopularCommunitiesTool();
        const result = await tool.func({ count });

        expect(tool.name).toBe('get_popular_communities');
        expect(mockComunidadesService.findAll).toHaveBeenCalled();

        // 3. O resultado deve ser JSON contendo [Grande, Media] (Nesta ordem!)
        const parsedResult = JSON.parse(result);
        expect(parsedResult).toHaveLength(2);        // Respeitou o count=2?
        expect(parsedResult[0].nome).toBe('Grande'); // O primeiro é o maior?
        expect(parsedResult[1].nome).toBe('Media');  // O segundo é o médio?
        // A 'Pequena' deve ter sido cortada fora.
      });

      it('deve lidar com erros no findAll', async () => {
        const errorMessage = 'Erro no banco';
        mockComunidadesService.findAll.mockRejectedValue(new Error(errorMessage));

        const tool = service.createGetPopularCommunitiesTool();
        const result = await tool.func({ count: 5 });

        expect(result).toBe(`Erro ao buscar comunidades: ${errorMessage}`);
      });
    });

    it('createGetCommunitiesTool: should delegate to ComunidadesService.findOne', async () => {
      const communityName = 'Ficção';
      mockComunidadesService.findOne.mockResolvedValue(mockCommunity);

      const tool = service.createGetCommunitiesTool();
      const result = await tool.func({ communityName });

      expect(mockComunidadesService.findOne).toHaveBeenCalledWith(communityName);
      expect(result).toBe(JSON.stringify(mockCommunity));
    });

    it('createGetPopularPostsInCommunityTool: should delegate to findAllPosts', async () => {
      const communityName = 'Ficção';
      mockComunidadesService.findAllPosts.mockResolvedValue([mockStory]);

      const tool = service.createGetPopularPostsInCommunityTool();
      const result = await tool.func({ communityName });

      expect(mockComunidadesService.findAllPosts).toHaveBeenCalledWith(communityName);
      expect(result).toBe(JSON.stringify([mockStory]));
    });
  });

  // --- Testes de Ferramentas de Readlist ---
  describe('Readlist Tools', () => {
    const userId = 'user-123';
    const readlistId = 'readlist-abc';
    const readlistName = 'Favoritos';

    it('createFindReadlistByNameTool: should find readlist by name', async () => {
      const mockReadlists = [{ nome: 'Favoritos', _id: readlistId }];
      mockReadlistsService.findAll.mockResolvedValue(mockReadlists);

      const tool = service.createFindReadlistByNameTool(userId);
      const result = await tool.func({ readlistName });

      expect(mockReadlistsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toBe(JSON.stringify({ id: readlistId, nome: readlistName }));
    });
  });

  // --- Testes de Ferramentas de Usuário ---
  describe('User Tools', () => {
    const userId = 'user-123';

    it('createUsersGetMyReadlistsTool: should return user readlists', async () => {
      const mockReadlists = [{ _id: 'r1', nome: 'R1' }];
      mockReadlistsService.findAll.mockResolvedValue(mockReadlists);

      const tool = service.createUsersGetMyReadlistsTool(userId);
      const result = await tool.func({});

      expect(mockReadlistsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toBe(JSON.stringify(mockReadlists));
    });

    it('createGravarLeituraTool: should delegate to registroLeitura', async () => {
      const params = { livroId: 'livro-1', qtd: 10, opcao: 1 };
      mockUsersService.registroLeitura.mockResolvedValue(true);

      const tool = service.createGravarLeituraTool(userId);
      await tool.func(params);

      expect(mockUsersService.registroLeitura).toHaveBeenCalledWith(params.livroId, params.opcao, params.qtd);
    });

    it('createUsersGetMyProfileTool: should delegate to findOne', async () => {
      const mockProfile = { username: 'test' };
      mockUsersService.findOne.mockResolvedValue(mockProfile);

      const tool = service.createUsersGetMyProfileTool(userId);
      const result = await tool.func({});

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBe(JSON.stringify(mockProfile));
    });

    it('createUsersGetMyFavoritesReadlistsTool: should return favorite readlists', async () => {
      const mockFavorites = [{ _id: 'fav1', nome: 'Fav' }];
      mockUsersService.findReadlistsFavoritas.mockResolvedValue(mockFavorites);

      const tool = service.createUsersGetMyFavoritesReadlistsTool(userId);
      const result = await tool.func({});

      expect(mockUsersService.findReadlistsFavoritas).toHaveBeenCalledWith(userId);
      expect(result).toBe(JSON.stringify(mockFavorites));
    });
  });
});