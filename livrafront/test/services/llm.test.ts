import { postGenerateText, postAnalyzeAgent } from '@/services/llm';
import type { GenerateTextDTO, LlmResponseDTO, AgentInputDTO } from '@/types/chat';

const originalFetch = global.fetch;

beforeAll(() => {
  // garante que fetch exista para tipagem; Jest normalmente já traz.
  if (!originalFetch) {
    global.fetch = jest.fn();
  }
});

beforeEach(() => {
  // substitui fetch por mock antes de cada teste
  global.fetch = jest.fn() as any;
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  // restaura fetch original (se existir)
  if (originalFetch) {
    global.fetch = originalFetch;
  }
});

describe('llm service functions', () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  describe('postGenerateText', () => {
    it('envia POST /llm/gerar com payload, token, signal e retorna o JSON quando ok', async () => {
      const payload: GenerateTextDTO = {
        userWriting: 'Era uma vez...',
        wordLimit: 200,
        genres: ['fantasia'],
        storyId: null,
      };
      const token = 'jwt-token-123';
      const controller = new AbortController();

      const mockResponse: LlmResponseDTO = {
        storyId: 'story-123',
        textoCapitulo: 'Capítulo gerado',
        novasOpcoes: [{ id: 1, texto: 'Continuar pela floresta' }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await postGenerateText(
        payload,
        token,
        controller.signal,
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/llm/gerar`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('lança erro com mensagem vinda de text() quando a resposta não é ok', async () => {
      const payload = {} as GenerateTextDTO;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('falha interna no LLM'),
      });

      await expect(postGenerateText(payload, 'token')).rejects.toThrow(
        'LLM 500: falha interna no LLM',
      );
    });

    it('usa statusText quando text() retorna vazio', async () => {
      const payload = {} as GenerateTextDTO;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue(''),
      });

      await expect(postGenerateText(payload, 'token')).rejects.toThrow(
        'LLM 400: Bad Request',
      );
    });
  });

  describe('postAnalyzeAgent', () => {
    it('envia POST /llm/analisar com payload, credentials include e retorna JSON quando ok', async () => {
      const payload: AgentInputDTO = { userPrompt: 'Olá, assistente!' };
      const controller = new AbortController();

      const mockResponse = { response: 'Olá, posso ajudar sim.' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await postAnalyzeAgent(payload, controller.signal);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/llm/analisar`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
          signal: controller.signal,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('lança erro específico para status 401 (usuário não autenticado)', async () => {
      const payload: AgentInputDTO = { userPrompt: 'Teste auth' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue(''), // não importa o texto
      });

      await expect(postAnalyzeAgent(payload)).rejects.toThrow(
        'Usuário não autenticado (sessão inválida).',
      );
    });

    it('lança erro genérico para outros status com mensagem de text()', async () => {
      const payload: AgentInputDTO = { userPrompt: 'Teste erro 400' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('request inválido'),
      });

      await expect(postAnalyzeAgent(payload)).rejects.toThrow(
        'LLM 400: request inválido',
      );
    });

    it('usa statusText quando text() retorna vazio ou falha', async () => {
      const payload: AgentInputDTO = { userPrompt: 'Teste erro 500' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue(''),
      });

      await expect(postAnalyzeAgent(payload)).rejects.toThrow(
        'LLM 500: Internal Server Error',
      );
    });
  });
});
