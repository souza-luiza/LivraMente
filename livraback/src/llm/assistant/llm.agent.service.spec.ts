import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm.agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm.tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { createAgent } from 'langchain';

// --- Mocks das Dependências Externas ---
const mockAgentInvoke = jest.fn();
jest.mock('langchain', () => ({
  createAgent: jest.fn(() => ({
    invoke: mockAgentInvoke,
  })),
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

// --- Mocks dos Serviços Internos ---
const mockUserStoriesTool = {
  name: 'get_user_stories',
  description: 'Busca histórias do usuário',
};
const mockPopularCommunitiesTool = {
  name: 'get_popular_communities',
  description: 'Busca comunidades populares',
};
const mockRecentStoriesTool = {
  name: 'get_recent_stories',
  description: 'Busca histórias recentes',
};
const mockJoinCommunityTool = {
  name: 'join_community',
  description: 'Entra na comunidade',
};
const mockGetCommunityTool = {
  name: 'get_community',
  description: 'Busca comunidade',
};
const mockLeaveCommunityTool = {
  name: 'leave_community',
  description: 'Sai da comunidade',
};
const mockToolsArray = [
  mockUserStoriesTool,
  mockPopularCommunitiesTool,
  mockRecentStoriesTool,
  mockJoinCommunityTool,
  mockGetCommunityTool,
  mockLeaveCommunityTool,
];

const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockUserStoriesTool),
  createGetPopularCommunitiesTool: jest.fn(() => mockPopularCommunitiesTool),
  createGetRecentStoriesTool: jest.fn(() => mockRecentStoriesTool),
  createJoinCommunityTool: jest.fn(() => mockJoinCommunityTool),
  createGetCommunityTool: jest.fn(() => mockGetCommunityTool),
  createLeaveCommunityTool: jest.fn(() => mockLeaveCommunityTool)
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
    jest.clearAllMocks(); // Limpa todos os mocks

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmAgentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LlmToolsService,
          useValue: mockLlmToolsService,
        },
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

  it('should initialize ChatGoogleGenerativeAI with API key and settings', () => {
    expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'mock-google-api-key',
        model: 'gemini-2.5-flash',
        temperature: 0.3,
      }),
    );
  });

  describe('runAnalysisAgent (Happy Path)', () => {
    const userPrompt = 'Qual a minha história mais longa?';
    const userId = 'user-123';
    const mockFinalAnswer = 'Sua história mais longa é "O Dragão de Gelo".';
    const mockFormattedPrompt = 'Este é o prompt do sistema formatado';

    beforeEach(() => {
      mockAgentInvoke.mockResolvedValue({ output: mockFinalAnswer });
      mockFormat.mockResolvedValue(mockFormattedPrompt);
    });

    it('should call tools service to get all tools', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      expect(mockLlmToolsService.createGetUserStoriesTool).toHaveBeenCalledWith(
        userId,
      );
      expect(
        mockLlmToolsService.createGetPopularCommunitiesTool,
      ).toHaveBeenCalled();
      expect(mockLlmToolsService.createGetRecentStoriesTool).toHaveBeenCalled();
    });

    it('should correctly format the system prompt', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
    
      expect(PromptTemplate.fromTemplate).toHaveBeenCalledWith(
        expect.stringContaining('Você é um assistente inteligente'),
      );

      expect(mockPartial).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.stringContaining("get_user_stories: Busca histórias do usuário, leave_community: Sai da comunidade"),
          tool_names: "get_user_stories, get_popular_communities, get_recent_stories, get_community, join_community",
        }),
      );

      expect(mockFormat).toHaveBeenCalledWith({
        input: '',
        agent_scratchpad: '',
      });
    });

    it('should call createAgent with the correct parameters', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      
      expect(createAgent).toHaveBeenCalledWith({
        model: expect.any(Object), // O mock do LLM
        tools: mockToolsArray,     // O array de ferramentas mockadas
        systemPrompt: mockFormattedPrompt, // O prompt formatado
      });
    });

    it('should invoke the agent with the user prompt in messages', async () => {
      await service.runAnalysisAgent(userPrompt, userId);
      
      expect(mockAgentInvoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: userPrompt }],
      });
    });

    it('should return the "output" field from the agent result', async () => {
      const result = await service.runAnalysisAgent(userPrompt, userId);
      expect(result).toBe(mockFinalAnswer);
    });
  });

  describe('runAnalysisAgent (Resilience & Error Handling)', () => {
    it('should return "final_output" if "output" is missing', async () => {
      const mockResult = { final_output: 'Resposta de final_output' };
      mockAgentInvoke.mockResolvedValue(mockResult);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      expect(result).toBe('Resposta de final_output');
    });

    it('should return last message content if "output" is missing', async () => {
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

    it('should return a JSON string if the response is an object', async () => {
      const mockResult = { foo: 'bar' };
      mockAgentInvoke.mockResolvedValue(mockResult);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      expect(result).toBe(JSON.stringify(mockResult));
    });

    it('should return an error message if agent invocation fails', async () => {
      const error = new Error('Invocação falhou');
      mockAgentInvoke.mockRejectedValue(error);

      const result = await service.runAnalysisAgent('teste', 'user-123');
      
      expect(result).toBe(
        'Desculpe, ocorreu um erro ao tentar processar sua solicitação.',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LlmAgentService] Erro ao executar o Agente:',
        error,
      );
    });
  });
});