import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm.agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm.tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';

// --- Mocks das Dependências Externas ---
const mockAgentInvoke = jest.fn();
jest.mock('langchain', () => ({
  createAgent: jest.fn(() => ({
    invoke: mockAgentInvoke,
  })),
  DynamicStructuredTool: jest.fn(),
}));

const mockFormat = jest.fn();
const mockPartial = jest.fn(() => ({
  format: mockFormat,
}));
jest.mock('@langchain/core/prompts', () => ({
  PromptTemplate: {
    fromTemplate: jest.fn(() => ({
      partial: mockPartial,
    })),
  },
}));

jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn(() => ({
    // Retorna um objeto vazio, pois ele é apenas passado para createAgent
  })),
}));

// Isso impede que o teste tente acessar a internet de verdade
jest.mock('@langchain/community/tools/duckduckgo_search', () => ({
  DuckDuckGoSearch: jest.fn().mockImplementation(() => ({
    name: 'duckduckgo_search',
    description: 'Search the web',
  })),
}));

// --- Mocks dos Serviços Internos ---
const mockTools = {
  get_user_stories: { name: 'get_user_stories', description: 'd1' },
  get_recent_stories: { name: 'get_recent_stories', description: 'd2' },
  get_popular_posts_in_community: { name: 'get_popular_posts_in_community', description: 'd3' },
  get_community: { name: 'get_community', description: 'd4' },
  get_popular_communities: { name: 'get_popular_communities', description: 'd5' },
  join_community: { name: 'join_community', description: 'd6' },
  leave_community: { name: 'leave_community', description: 'd7' },
  find_readlist_by_name: { name: 'find_readlist_by_name', description: 'd8' },
  find_livro_by_name: { name: 'find_livro_by_name', description: 'd9' },
  add_book_to_readlist: { name: 'add_book_to_readlist', description: 'd10' },
  remove_book_from_readlist: { name: 'remove_book_from_readlist', description: 'd11' },
  create_readlist: { name: 'create_readlist', description: 'd12' },
  delete_readlist: { name: 'delete_readlist', description: 'd13' },
  users_get_my_readlists: { name: 'users_get_my_readlists', description: 'd14' },
  gravar_leitura: { name: 'gravar_leitura', description: 'd15' },
  users_get_my_profile: { name: 'users_get_my_profile', description: 'd16' },
  users_get_my_favorites_readlists: { name: 'users_get_my_favorites_readlists', description: 'd17' },
  duckduckgo_search: { name: 'duckduckgo_search', description: 'Search the web' },
};

const mockToolsArray = [
  mockTools.get_user_stories,
  mockTools.get_recent_stories,
  mockTools.get_popular_posts_in_community,
  mockTools.get_community,
  mockTools.get_popular_communities,
  mockTools.join_community,
  mockTools.leave_community,
  mockTools.find_readlist_by_name,
  mockTools.find_livro_by_name,
  mockTools.add_book_to_readlist,
  mockTools.remove_book_from_readlist,
  mockTools.create_readlist,
  mockTools.delete_readlist,
  mockTools.users_get_my_readlists,
  mockTools.gravar_leitura,
  mockTools.users_get_my_profile,
  mockTools.users_get_my_favorites_readlists,
  ...Object.values(mockTools).filter(t => t.name !== 'duckduckgo_search'),
  expect.any(DuckDuckGoSearch),
];


const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockTools.get_user_stories),
  createGetRecentStoriesTool: jest.fn(() => mockTools.get_recent_stories),
  createGetPopularPostsInCommunityTool: jest.fn(() => mockTools.get_popular_posts_in_community),

  createGetCommunitiesTool: jest.fn(() => mockTools.get_community),
  createGetPopularCommunitiesTool: jest.fn(() => mockTools.get_popular_communities),
  createJoinCommunityTool: jest.fn(() => mockTools.join_community),
  createLeaveCommunityTool: jest.fn(() => mockTools.leave_community),

  createFindReadlistByNameTool: jest.fn(() => mockTools.find_readlist_by_name),

  createAddBookToReadlistTool: jest.fn(() => mockTools.add_book_to_readlist),
  createRemoveBookFromReadlistTool: jest.fn(() => mockTools.remove_book_from_readlist),
  createCreateReadlistTool: jest.fn(() => mockTools.create_readlist),
  createDeleteReadlistTool: jest.fn(() => mockTools.delete_readlist),
  createUsersGetMyReadlistsTool: jest.fn(() => mockTools.users_get_my_readlists),

  createGravarLeituraTool: jest.fn(() => mockTools.gravar_leitura),
  createUsersGetMyProfileTool: jest.fn(() => mockTools.users_get_my_profile),
  createUsersGetMyFavoritesReadlistsTool: jest.fn(() => mockTools.users_get_my_favorites_readlists),

  createDuckDuckGoSearchTool: jest.fn(() => mockTools.duckduckgo_search),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'GOOGLE_API_KEY') return 'mock-google-api-key';
    return null;
  }),
};

// --- Início dos Testes ---
describe('LlmAgentService', () => {
  let service: LlmAgentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmAgentService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LlmToolsService, useValue: mockLlmToolsService },
      ],
    }).compile();
    service = module.get<LlmAgentService>(LlmAgentService);
  });

  describe('runAnalysisAgent', () => {
    const userPrompt = 'Olá';
    const userId = '123';

    beforeEach(() => {
      mockAgentInvoke.mockResolvedValue({ output: 'Olá humano' });
      mockFormat.mockResolvedValue('Prompt formatado');
      (createAgent as jest.Mock).mockReturnValue({ invoke: mockAgentInvoke });
    });

    it('deve chamar todas as fábricas de ferramentas', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      // Verifica ferramentas principais
      expect(mockLlmToolsService.createGetUserStoriesTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createGetPopularPostsInCommunityTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createUsersGetMyFavoritesReadlistsTool).toHaveBeenCalledWith(userId);
      // Verifica DuckDuckGo
      expect(mockLlmToolsService.createDuckDuckGoSearchTool).toHaveBeenCalled();
    });

    it('deve chamar createAgent com as ferramentas corretas (incluindo DuckDuckGo)', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      expect(createAgent).toHaveBeenCalledWith({
        model: expect.any(Object),
        tools: expect.arrayContaining(mockToolsArray),
        systemPrompt: expect.any(String),
      });
    });
  });
});