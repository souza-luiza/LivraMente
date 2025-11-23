import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm-agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm-tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';

// --- Mocks das Dependências Externas ---
const mockAgentInvoke = jest.fn();

// Mock do createAgent
jest.mock('langchain', () => {
  return {
    createAgent: jest.fn().mockResolvedValue({}),
  };
});

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
  ChatGoogleGenerativeAI: jest.fn(() => ({})),
}));

// Mock da ferramenta DuckDuckGo
jest.mock('@langchain/community/tools/duckduckgo_search', () => ({
  DuckDuckGoSearch: jest.fn().mockImplementation(() => ({
    name: 'duckduckgo_search',
    description: 'Search the web',
  })),
}));

// --- Mock Robusto do LlmToolsService (Sem Proxy pra ver se dar certo) ---
const mockTool = { name: 'mock_tool', description: 'descrição teste' };

const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockTool),
  createGetRecentStoriesTool: jest.fn(() => mockTool),
  createGetCommunitiesTool: jest.fn(() => mockTool),
  createGetPopularCommunitiesTool: jest.fn(() => mockTool),
  createJoinCommunityTool: jest.fn(() => mockTool),
  createLeaveCommunityTool: jest.fn(() => mockTool),
  createFindReadlistByNameTool: jest.fn(() => mockTool),
  createFindLivroByNameTool: jest.fn(() => mockTool),
  createAddBookToReadlistTool: jest.fn(() => mockTool),
  createRemoveBookFromReadlistTool: jest.fn(() => mockTool),
  createCreateReadlistTool: jest.fn(() => mockTool),
  createDeleteReadlistTool: jest.fn(() => mockTool),
  createUsersGetMyReadlistsTool: jest.fn(() => mockTool),
  createGravarLeituraTool: jest.fn(() => mockTool),
  createUsersGetMyProfileTool: jest.fn(() => mockTool),
  createUsersGetMyFavoritesReadlistsTool: jest.fn(() => mockTool),
  createGetPopularPostsInCommunityTool: jest.fn(() => mockTool),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'GOOGLE_API_KEY') return 'mock-google-api-key';
    return null;
  }),
};

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
      mockAgentInvoke.mockResolvedValue({ output: 'Resposta da IA' });
      mockFormat.mockResolvedValue('Prompt Formatado');
    });

    it('deve chamar createAgent e AgentExecutor corretamente', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      
      // Verifica se criou o agente ReAct
      expect(createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          llm: expect.any(Object),
          tools: expect.any(Array),
          prompt: expect.any(Object),
        })
      );
    });

    it('deve invocar o executor com o input correto', async () => {
      await service.runAnalysisAgent(userPrompt, userId);

      expect(mockAgentInvoke).toHaveBeenCalledWith({
        input: userPrompt,
      });
    });

    it('deve retornar a resposta final', async () => {
      const result = await service.runAnalysisAgent(userPrompt, userId);
      expect(result).toBe('Resposta da IA');
    });
  });
});