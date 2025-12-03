import { Test, TestingModule } from '@nestjs/testing';
import { LlmAgentService } from './llm-agent.service';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm-tools.service';
import { createAgent } from 'langchain';

// --- Mocks ---

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

jest.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn(() => ({})),
}));

const mockDuckInstance = { name: 'duckduckgo_search', description: 'search' };
jest.mock('@langchain/community/tools/duckduckgo_search', () => ({
  DuckDuckGoSearch: jest.fn().mockImplementation(() => mockDuckInstance),
}), { virtual: true });

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
  createDuckDuckGoTool: jest.fn(() => mockDuckInstance),
};

const mockConfigService = {
  get: jest.fn((key) => (key === 'GOOGLE_API_KEY' ? 'key' : null)),
};

describe('LlmAgentService', () => {
  let service: LlmAgentService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Spy nos console.log e console.error
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

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
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Respostas Hardcoded (Frases de Ajuda)', () => {
    const userId = '123';
    const respostaEsperada = "Eu posso te ajudar a encontrar informações sobre histórias, comunidades e readlists. Posso buscar suas histórias criadas, histórias recentes do site, comunidades populares, detalhes de comunidades específicas, posts populares em comunidades, suas readlists e readlists favoritas. Também posso registrar seu progresso de leitura. No entanto, não posso criar, deletar, adicionar ou remover itens. Para essas ações, você precisará usar a interface do site.";

    const frasesDeAjuda = [
      'ajuda',
      'help',
      'utilidade',
      'qual sua utilidade',
      'o que você faz',
      'menu'
    ];

    frasesDeAjuda.forEach(frase => {
      it(`deve retornar resposta padrão para "${frase}" SEM chamar a IA`, async () => {
        const result = await service.runAnalysisAgent(frase, userId);
        
        expect(result).toBe(respostaEsperada);
        expect(createAgent).not.toHaveBeenCalled();
        expect(mockAgentRunnable.invoke).not.toHaveBeenCalled();
      });
    });

    it('deve ser case-insensitive (aceitar "AJUDA" em maiúsculas)', async () => {
      const result = await service.runAnalysisAgent('AJUDA', userId);
      
      expect(result).toBe(respostaEsperada);
      expect(createAgent).not.toHaveBeenCalled();
    });
  });

  describe('Perguntas Normais (Via Agente)', () => {
    const userId = '123';

    beforeEach(() => {
      // Mock padrão: resposta com estrutura de mensagens
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [
          { role: 'user', content: 'Pergunta do usuário' },
          { role: 'assistant', content: 'Resposta Final: A história X é a mais longa.' }
        ]
      });
    });

    it('deve chamar o agente para perguntas normais', async () => {
      const userPrompt = 'Qual a história mais longa?';
      const result = await service.runAnalysisAgent(userPrompt, userId);

      expect(result).toBe('A história X é a mais longa.');
      expect(createAgent).toHaveBeenCalled();
      expect(mockAgentRunnable.invoke).toHaveBeenCalled();
    });

    it('deve extrair apenas a "Resposta Final:" da resposta do agente', async () => {
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [
          { 
            role: 'assistant', 
            content: 'Pensamento: Vou buscar...\nAção: get_user_stories\nObservação: [dados]\nResposta Final: Aqui estão suas histórias.' 
          }
        ]
      });

      const result = await service.runAnalysisAgent('Mostre minhas histórias', userId);

      expect(result).toBe('Aqui estão suas histórias.');
      expect(result).not.toContain('Pensamento:');
      expect(result).not.toContain('Ação:');
    });

    it('deve retornar o conteúdo completo se não houver "Resposta Final:"', async () => {
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [
          { role: 'assistant', content: 'Resposta direta sem marcador.' }
        ]
      });

      const result = await service.runAnalysisAgent('Teste', userId);

      expect(result).toBe('Resposta direta sem marcador.');
    });

    it('deve usar fallback para result.output se messages não existir', async () => {
      mockAgentRunnable.invoke.mockResolvedValue({
        output: 'Resposta Final: Fallback funcionou.'
      });

      const result = await service.runAnalysisAgent('Teste fallback', userId);

      expect(result).toBe('Fallback funcionou.');
    });
  });

  describe('Gerenciamento de Histórico', () => {
    const userId = '123';

    beforeEach(() => {
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [{ role: 'assistant', content: 'Resposta Final: OK' }]
      });
    });

    it('deve funcionar com histórico vazio', async () => {
      const result = await service.runAnalysisAgent('Teste', userId, []);

      expect(result).toBe('OK');
      expect(mockAgentRunnable.invoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: 'Teste' }]
      });
    });

    it('deve incluir histórico nas mensagens enviadas ao agente', async () => {
      const history = [
        { role: 'user', content: 'Mensagem 1' },
        { role: 'assistant', content: 'Resposta 1' },
        { role: 'user', content: 'Mensagem 2' },
        { role: 'assistant', content: 'Resposta 2' }
      ];

      await service.runAnalysisAgent('Nova pergunta', userId, history);

      expect(mockAgentRunnable.invoke).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ content: 'Mensagem 1' }),
            expect.objectContaining({ content: 'Resposta 1' }),
            expect.objectContaining({ content: 'Mensagem 2' }),
            expect.objectContaining({ content: 'Resposta 2' }),
            { role: 'user', content: 'Nova pergunta' }
          ])
        })
      );
    });

    it('deve limitar o histórico ao padrão de 10 mensagens', async () => {
      // Cria 20 mensagens de histórico
      const history = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Mensagem ${i + 1}`
      }));

      await service.runAnalysisAgent('Nova pergunta', userId, history);

      const invokeCall = mockAgentRunnable.invoke.mock.calls[0][0];
      const sentMessages = invokeCall.messages;

      // Deve ter 11 mensagens: 10 do histórico + 1 nova
      expect(sentMessages).toHaveLength(11);
      
      // Deve ter as 10 ÚLTIMAS mensagens do histórico
      expect(sentMessages[0].content).toContain('Mensagem 11'); // Primeira das últimas 10
      expect(sentMessages[9].content).toContain('Mensagem 20'); // Última do histórico
      expect(sentMessages[10].content).toBe('Nova pergunta'); // Nova mensagem
    });

    it('deve respeitar o parâmetro maxHistoryMessages customizado', async () => {
      const history = Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Mensagem ${i + 1}`
      }));

      // Limita a apenas 4 mensagens
      await service.runAnalysisAgent('Nova pergunta', userId, history, 4);

      const invokeCall = mockAgentRunnable.invoke.mock.calls[0][0];
      const sentMessages = invokeCall.messages;

      // Deve ter 5 mensagens: 4 do histórico + 1 nova
      expect(sentMessages).toHaveLength(5);
      expect(sentMessages[0].content).toContain('Mensagem 7'); // Primeira das últimas 4
    });

    it('deve logar estatísticas do histórico', async () => {
      const history = [
        { role: 'user', content: 'Msg 1' },
        { role: 'assistant', content: 'Resp 1' }
      ];

      await service.runAnalysisAgent('Teste', userId, history);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Histórico: 2 msgs (1 usuário, 1 assistente)]')
      );
    });
  });

  describe('Tratamento de Erros', () => {
    const userId = '123';

    it('deve retornar mensagem de erro amigável quando o agente falhar', async () => {
      mockAgentRunnable.invoke.mockRejectedValue(new Error('Erro da API'));

      const result = await service.runAnalysisAgent('Teste', userId);

      expect(result).toBe('Desculpe, ocorreu um erro ao tentar processar sua solicitação.');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LlmAgentService] Erro ao executar o Agente:',
        expect.any(Error)
      );
    });

    it('deve retornar fallback se result for null/undefined', async () => {
      mockAgentRunnable.invoke.mockResolvedValue(null);

      const result = await service.runAnalysisAgent('Teste', userId);

      expect(result).toBe('Desculpe, não consegui processar sua solicitação.');
    });

    it('deve lidar com resposta sem conteúdo', async () => {
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [{ role: 'assistant', content: '' }]
      });

      const result = await service.runAnalysisAgent('Teste', userId);

      expect(result).toBe('Desculpe, não consegui processar sua solicitação.');
    });
  });

  describe('Configuração do Agente', () => {
    it('deve criar o agente com as ferramentas corretas', async () => {
      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [{ role: 'assistant', content: 'OK' }]
      });

      await service.runAnalysisAgent('Teste', '123');

      expect(createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.arrayContaining([
            mockTools.get_user_stories,
            mockTools.get_recent_stories,
            mockTools.gravar_leitura,
            mockDuckInstance
          ])
        })
      );
    });

    it('deve incluir o histórico formatado no systemPrompt', async () => {
      const history = [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: 'Oi!' }
      ];

      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [{ role: 'assistant', content: 'OK' }]
      });

      await service.runAnalysisAgent('Teste', '123', history);

      expect(mockFormat).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_history: expect.stringContaining('Usuário: Olá')
        })
      );

      expect(mockFormat).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_history: expect.stringContaining('Assistente: Oi!')
        })
      );
    });
  });

  describe('Integração - Fluxo Completo', () => {
    it('deve processar uma conversa completa corretamente', async () => {
      const userId = '123';
      const history = [
        { role: 'user', content: 'Quais minhas histórias?' },
        { role: 'assistant', content: 'Você tem 3 histórias: A, B, C.' }
      ];

      mockAgentRunnable.invoke.mockResolvedValue({
        messages: [
          {
            role: 'assistant',
            content: 'Pensamento: Vou buscar mais detalhes\nAção: get_user_stories\nObservação: [dados]\nResposta Final: A história A tem 100 páginas.'
          }
        ]
      });

      const result = await service.runAnalysisAgent(
        'Quantas páginas tem a história A?',
        userId,
        history
      );

      expect(result).toBe('A história A tem 100 páginas.');
      expect(result).not.toContain('Pensamento:');
      
      const invokeCall = mockAgentRunnable.invoke.mock.calls[0][0];
      expect(invokeCall.messages).toHaveLength(3); // 2 do histórico + 1 nova
    });
  });
});