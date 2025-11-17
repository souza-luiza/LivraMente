import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm.agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm.tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';
import { DuckDuckGoSearch } from 'node_modules/@langchain/community/dist/tools/duckduckgo_search';

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
  DuckDuckGoSearchRun: jest.fn().mockImplementation(() => ({
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
  users_get_my_favorites: { name: 'users_get_my_favorites', description: 'd17' },
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
  mockTools.users_get_my_favorites,
  expect.any(DuckDuckGoSearch),
];

const mockToolNamesString = mockToolsArray.map((t) => t.name).join(', ');
const mockToolsBlockString = mockToolsArray
  .map((t) => `- ${t.name}: ${t.description}`)
  .join('\n');

const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockTools.get_user_stories),
  createGetRecentStoriesTool: jest.fn(() => mockTools.get_recent_stories),
  createGetPopularPostsInCommunityTool: jest.fn(() => mockTools.get_popular_posts_in_community),
  createGetCommunitiesTool: jest.fn(() => mockTools.get_community),
  createGetPopularCommunitiesTool: jest.fn(() => mockTools.get_popular_communities),
  createJoinCommunityTool: jest.fn(() => mockTools.join_community),
  createLeaveCommunityTool: jest.fn(() => mockTools.leave_community),
  createFindReadlistByNameTool: jest.fn(() => mockTools.find_readlist_by_name),
  createFindLivroByNameTool: jest.fn(() => mockTools.find_livro_by_name),
  createAddBookToReadlistTool: jest.fn(() => mockTools.add_book_to_readlist),
  createRemoveBookFromReadlistTool: jest.fn(() => mockTools.remove_book_from_readlist),
  createCreateReadlistTool: jest.fn(() => mockTools.create_readlist),
  createDeleteReadlistTool: jest.fn(() => mockTools.delete_readlist),
  createUsersGetMyReadlistsTool: jest.fn(() => mockTools.users_get_my_readlists),
  createGravarLeituraTool: jest.fn(() => mockTools.gravar_leitura),
  createUsersGetMyProfileTool: jest.fn(() => mockTools.users_get_my_profile),
  createUsersGetMyFavoritesTool: jest.fn(() => mockTools.users_get_my_favorites),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve inicializar o ChatGoogleGenerativeAI com as configurações corretas', () => {
    expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'mock-google-api-key',
        model: 'gemini-2.5-flash',
        temperature: 0.3,
      }),
    );
  });

  describe('runAnalysisAgent (Caminho Feliz)', () => {
    const userPrompt = 'Qual a minha história mais longa?';
    const userId = 'user-123';
    const mockFinalAnswer = 'Sua história mais longa é "O Dragão de Gelo".';
    const mockFormattedPrompt = 'Este é o prompt do sistema formatado';

    beforeEach(() => {
      mockAgentInvoke.mockResolvedValue({ output: mockFinalAnswer });
      mockFormat.mockResolvedValue(mockFormattedPrompt);
    });

    it('deve chamar todas as 17 fábricas de ferramentas', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      // Verifica todas as chamadas
      expect(mockLlmToolsService.createGetUserStoriesTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createGetRecentStoriesTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createGetPopularPostsInCommunityTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createGetCommunitiesTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createGetPopularCommunitiesTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createJoinCommunityTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createLeaveCommunityTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createFindReadlistByNameTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createFindLivroByNameTool).toHaveBeenCalled();
      expect(mockLlmToolsService.createAddBookToReadlistTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createRemoveBookFromReadlistTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createCreateReadlistTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createDeleteReadlistTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createUsersGetMyReadlistsTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createGravarLeituraTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createUsersGetMyProfileTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createUsersGetMyFavoritesTool).toHaveBeenCalledWith(userId);
      expect(mockLlmToolsService.createDuckDuckGoSearchTool).toHaveBeenCalled();
    });

    it('deve formatar o prompt do sistema corretamente', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(PromptTemplate.fromTemplate).toHaveBeenCalledWith(
        expect.stringContaining('Você é um assistente prestativo'),
      );

      expect(mockPartial).toHaveBeenCalledWith({
        tools: mockToolsBlockString,
        tool_names: mockToolNamesString,
      });

      expect(mockFormat).toHaveBeenCalledWith({
        input: '',
        agent_scratchpad: '',
      });
    });

    it('deve chamar createAgent com as ferramentas corretas (incluindo DuckDuckGo)', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(createAgent as any).toHaveBeenCalledWith({
        model: expect.any(Object),
        tools: mockToolsArray,
        prompt: expect.any(Object),
      });
    });

    it('deve chamar createAgent com os parâmetros corretos', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(createAgent).toHaveBeenCalledWith({
        model: expect.any(Object),
        tools: mockToolsArray,
        systemPrompt: mockFormattedPrompt,
      });
    });

    it('deve invocar o agente com o prompt do usuário em "messages"', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(mockAgentInvoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: userPrompt }],
      });
    });

    it('deve retornar o campo "output" do resultado do agente', async () => {
      const result = await service.runAnalysisAgent(userPrompt, userId);
      expect(result).toBe(mockFinalAnswer);
    });
  });

  describe('runAnalysisAgent (Resiliência e Erros)', () => {
    it('deve retornar "final_output" se "output" estiver ausente', async () => {
      const mockResult = { final_output: 'Resposta de final_output' };
      mockAgentInvoke.mockResolvedValue(mockResult);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      expect(result).toBe('Resposta de final_output');
    });

    it('deve retornar o conteúdo da última mensagem se "output" e "final_output" estiverem ausentes', async () => {
      const mockResult = {
        messages: [
          { role: 'user', content: 'pergunta' },
          { role: 'assistant', content: 'Resposta da mensagem' },
        ],
      };
      mockAgentInvoke.mockResolvedValue(mockResult);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      expect(result).toBe('Resposta da mensagem');
    });

    it('deve retornar um JSON stringificado se a resposta for um objeto', async () => {
      const mockResult = { foo: 'bar' }; // Sem 'output', 'final_output', ou 'messages'
      mockAgentInvoke.mockResolvedValue(mockResult);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      expect(result).toBe(JSON.stringify(mockResult));
    });

    it('deve retornar uma mensagem de erro se a invocação do agente falhar', async () => {
      const error = new Error('Invocação falhou');
      mockAgentInvoke.mockRejectedValue(error);

      const result = await service.runAnalysisAgent('teste', 'user-123');

      expect(result).toBe(
        'Desculpe, ocorreu um erro ao tentar processar sua solicitação.',
      );
      // Verifica se o erro foi logado no console
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LlmAgentService] Erro ao executar o Agente:',
        error,
      );
    });
  });
});