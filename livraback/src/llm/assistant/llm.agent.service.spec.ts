import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm.agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm.tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { PromptTemplate } from '@langchain/core/prompts';

// Mock do Agente e Executor
const mockAgentInvoke = jest.fn();
jest.mock('langchain/agents', () => ({
  createReactAgent: jest.fn(),
  AgentExecutor: jest.fn(() => ({
    invoke: mockAgentInvoke,
  })),
}));

// Mock do PromptTemplate
const mockPromptTemplate = { fromTemplate: jest.fn() };
jest.mock('@langchain/core/prompts', () => ({
  PromptTemplate: mockPromptTemplate,
}));

// Mock do ChatGoogleGenerativeAI
jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn(() => ({

  })),
}));


// Mock do LlmToolsService
const mockTool = {
  name: 'mock_get_user_stories',
  description: 'Mock tool',
  func: jest.fn(),
};
const mockLlmToolsService = {
  createGetUserStoriesTool: jest.fn(() => mockTool),
};

// Mock do ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'GOOGLE_API_KEY') return 'mock-google-api-key';
    return null;
  }),
};

describe('LlmAgentService', () => {
  let service: LlmAgentService;

  beforeEach(async () => {
    // Limpa mocks antes de cada teste
    jest.clearAllMocks();

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

  describe('runAnalysisAgent', () => {
    it('should create and invoke the agent executor successfully', async () => {
      const userPrompt = 'Qual é a minha história mais longa?';
      const userId = 'user-123';
      const expectedOutput = 'Sua história mais longa é "O Dragão de Gelo".';

      mockAgentInvoke.mockResolvedValue({ output: expectedOutput });

      const result = await service.runAnalysisAgent(userPrompt, userId);

      expect(mockLlmToolsService.createGetUserStoriesTool).toHaveBeenCalledWith(
        userId,
      );

      expect(mockPromptTemplate.fromTemplate).toHaveBeenCalledWith(
        expect.stringContaining('Você é um assistente inteligente integrado ao site Livramente.'),
      );

      expect(createReactAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [mockTool],
        }),
      );

      expect(AgentExecutor).toHaveBeenCalled();

      expect(mockAgentInvoke).toHaveBeenCalledWith({ input: userPrompt });

      expect(result).toBe(expectedOutput);
    });

    it('should handle errors during agent invocation', async () => {
      const userPrompt = 'Uma pergunta que causa erro';
      const userId = 'user-123';
      const error = new Error('API do Google falhou');

      mockAgentInvoke.mockRejectedValue(error);

      const result = await service.runAnalysisAgent(userPrompt, userId);

      expect(result).toBe(
        'Desculpe, não consegui processar sua solicitação. Verifique os logs do servidor.',
      );
    });
  });
});