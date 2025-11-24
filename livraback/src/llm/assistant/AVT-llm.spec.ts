import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm-agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm-tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';

const mockAgentRunnable = {
  invoke: jest.fn(),
};

jest.mock('langchain', () => ({
  createAgent: jest.fn(() => mockAgentRunnable),
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

const mockTools = {
  get_user_stories: { name: 'get_user_stories' },
  get_recent_stories: { name: 'get_recent_stories' },
  get_popular_posts_in_community: { name: 'get_popular_posts_in_community' },
  get_community: { name: 'get_community' },
  get_popular_communities: { name: 'get_popular_communities' },
  find_readlist_by_name: { name: 'find_readlist_by_name' },
  users_get_my_readlists: { name: 'users_get_my_readlists' },
  users_get_my_profile: { name: 'users_get_my_profile' },
  users_get_my_favorites_readlists: { name: 'users_get_my_favorites_readlists' },
  gravar_leitura: { name: 'gravar_leitura' },
};

const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockTools.get_user_stories),
  createGetRecentStoriesTool: jest.fn(() => mockTools.get_recent_stories),
  createGetPopularPostsInCommunityTool: jest.fn(() => mockTools.get_popular_posts_in_community),
  createGetCommunitiesTool: jest.fn(() => mockTools.get_community),
  createGetPopularCommunitiesTool: jest.fn(() => mockTools.get_popular_communities),
  createFindReadlistByNameTool: jest.fn(() => mockTools.find_readlist_by_name),
  createUsersGetMyReadlistsTool: jest.fn(() => mockTools.users_get_my_readlists),
  createGravarLeituraTool: jest.fn(() => mockTools.gravar_leitura),
  createUsersGetMyProfileTool: jest.fn(() => mockTools.users_get_my_profile),
  createUsersGetMyFavoritesReadlistsTool: jest.fn(() => mockTools.users_get_my_favorites_readlists),
};

const mockConfigService = {
  get: jest.fn((key) => (key === 'GOOGLE_API_KEY' ? 'key' : null)),
};

describe('LlmAgentService', () => {
  let service: LlmAgentService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmAgentService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LlmToolsService, useValue: mockLlmToolsService },
      ],
    }).compile();

    service = module.get<LlmAgentService>(LlmAgentService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('runAnalysisAgent', () => {
    const userPrompt = 'No que voce pode me ajudar';
    const userId = '123';
    const mockResponse = { output: 'Eu posso te ajudar a encontrar informações sobre histórias, comunidades e readlists.  Posso buscar suas histórias criadas, histórias recentes do site, comunidades populares, detalhes de comunidades específicas, posts populares em comunidades, suas readlists e readlists favoritas. Também posso registrar seu progresso de leitura. No entanto, não posso criar, deletar, adicionar ou remover itens. Para essas ações, você precisará usar a interface do site.' };
    const mockPromptString = 'Prompt Formatado';

    beforeEach(() => {
      mockAgentRunnable.invoke.mockResolvedValue(mockResponse);
      mockFormat.mockResolvedValue(mockPromptString);
    });

    it('deve retornar a resposta pré-definida', async () => {
      const result = await service.runAnalysisAgent(userPrompt, userId);
      expect(result).toBe('Eu posso te ajudar a encontrar informações sobre histórias, comunidades e readlists.  Posso buscar suas histórias criadas, histórias recentes do site, comunidades populares, detalhes de comunidades específicas, posts populares em comunidades, suas readlists e readlists favoritas. Também posso registrar seu progresso de leitura. No entanto, não posso criar, deletar, adicionar ou remover itens. Para essas ações, você precisará usar a interface do site.');
    });
  });
});