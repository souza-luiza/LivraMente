import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm-agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm-tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';

// --- Mocks ---

// 1. Mock do Agente (Runnable)
const mockAgentRunnable = {
  invoke: jest.fn(),
};

jest.mock('langchain', () => ({
  createAgent: jest.fn(() => mockAgentRunnable),
}));

// 2. Mocks do Prompt
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

// 3. Mocks do Google e DuckDuckGo
jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn(() => ({})),
}));

// Instância simulada do DuckDuckGo
const mockDuckInstance = { name: 'duckduckgo_search', description: 'search' };
jest.mock('@langchain/community/tools/duckduckgo_search', () => ({
  DuckDuckGoSearch: jest.fn().mockImplementation(() => mockDuckInstance),
}));

// --- Mocks das Ferramentas (Apenas as que MANTIVEMOS no Service) ---
const mockTools = {
  // Leitura / Busca
  get_user_stories: { name: 'get_user_stories' },
  get_recent_stories: { name: 'get_recent_stories' },
  get_popular_posts_in_community: { name: 'get_popular_posts_in_community' },
  get_community: { name: 'get_community' },
  get_popular_communities: { name: 'get_popular_communities' },
  find_readlist_by_name: { name: 'find_readlist_by_name' },
  users_get_my_readlists: { name: 'users_get_my_readlists' },
  users_get_my_profile: { name: 'users_get_my_profile' },
  users_get_my_favorites_readlists: { name: 'users_get_my_favorites_readlists' },

  // A única de escrita permitida
  gravar_leitura: { name: 'gravar_leitura' },
};

// Array esperado (Ferramentas Seguras + DuckDuckGo)
const expectedToolsMatcher = expect.arrayContaining([
  ...Object.values(mockTools),
  mockDuckInstance // Verifica se a instância do DuckDuckGo está aqui
]);

const mockLlmToolsService = {
  // Ferramentas mantidas
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

  // Mocks das ferramentas removidas (caso o service ainda tente chamar, retorna undefined)
  createJoinCommunityTool: jest.fn(),
  createLeaveCommunityTool: jest.fn(),
  createAddBookToReadlistTool: jest.fn(),
  createRemoveBookFromReadlistTool: jest.fn(),
  createCreateReadlistTool: jest.fn(),
  createDeleteReadlistTool: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key) => (key === 'GOOGLE_API_KEY' ? 'key' : null)),
};

describe('LlmAgentService', () => {
  let service: LlmAgentService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

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
    const userPrompt = 'Olá';
    const userId = '123';
    const mockResponse = { output: 'Resposta da IA' };
    const mockPromptString = 'Prompt Formatado';

    beforeEach(() => {
      mockAgentRunnable.invoke.mockResolvedValue(mockResponse);
      mockFormat.mockResolvedValue(mockPromptString);
    });

    it('deve criar o agente com as ferramentas seguras e DuckDuckGo', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(createAgent).toHaveBeenCalledWith({
        model: expect.any(Object),
        tools: expectedToolsMatcher, // Agora bate com a lista segura
        systemPrompt: mockPromptString,
      });
    });

    it('deve invocar o agente com messages', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      expect(mockAgentRunnable.invoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: userPrompt }],
      });
    });

    it('deve retornar a resposta processada', async () => {
      const result = await service.runAnalysisAgent(userPrompt, userId);
      expect(result).toBe('Resposta da IA');
    });

    it('deve lidar com erros na execução', async () => {
      const error = new Error('Erro no invoke');
      mockAgentRunnable.invoke.mockRejectedValue(error);

      const result = await service.runAnalysisAgent(userPrompt, userId);

      expect(result).toBe('Desculpe, ocorreu um erro ao tentar processar sua solicitação.');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LlmAgentService] Erro ao executar o Agente:',
        error,
      );
    });

    it('deve retornar a resposta PADRÃO para perguntas de ajuda (SEM chamar a IA)', async () => {
      const userPrompt = 'ajuda';
      const respostaEsperada = 'Eu posso te ajudar a encontrar informações sobre histórias, comunidades e readlists. Posso buscar suas histórias criadas, histórias recentes do site, comunidades populares, detalhes de comunidades específicas, posts populares em comunidades, suas readlists e readlists favoritas. Também posso registrar seu progresso de leitura. No entanto, não posso criar, deletar, adicionar ou remover itens. Para essas ações, você precisará usar a interface do site.';
      const result = await service.runAnalysisAgent(userPrompt, 'user-123');

      expect(result).toBe(respostaEsperada);
      expect(createAgent).not.toHaveBeenCalled();
    });

    it('deve chamar o Agente para perguntas normais', async () => {
      const userPrompt = 'Qual a história mais longa?';
      mockAgentRunnable.invoke.mockResolvedValue({ output: 'A história X.' });
      const result = await service.runAnalysisAgent(userPrompt, userId);

      expect(result).toBe('A história X.');
      expect(createAgent).toHaveBeenCalled();
      expect(mockAgentRunnable.invoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: userPrompt }]
      });
    });
  });
});