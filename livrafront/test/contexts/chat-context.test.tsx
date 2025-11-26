import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '@/contexts/chat-context';
import { postAnalyzeAgent } from '@/services/llm';

jest.mock('@/services/llm', () => ({
  postAnalyzeAgent: jest.fn(),
}));

// polyfill do crypto.randomUUID para o ambiente de teste
beforeAll(() => {
  if (!('crypto' in global)) {
    (global as any).crypto = {};
  }
  if (!(global.crypto as any).randomUUID) {
    (global.crypto as any).randomUUID = () => 'test-id';
  }
});

describe('ChatContext (sem JWT/token explícito)', () => {
  const mockedPostAnalyzeAgent = postAnalyzeAgent as jest.MockedFunction<
    typeof postAnalyzeAgent
  >;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChatProvider>{children}</ChatProvider>
  );

  beforeEach(() => {
    mockedPostAnalyzeAgent.mockReset();
  });

it('retorna fallback seguro quando usado fora de um ChatProvider e não lança', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const { result } = renderHook(() => useChat());

  expect(result.current.messages).toEqual([]);
  expect(result.current.isOpen).toBe(false);
  expect(result.current.isLoading).toBe(false);

  expect(typeof result.current.toggleOpen).toBe('function');
  expect(typeof result.current.sendMessage).toBe('function');
  expect(typeof result.current.resetChat).toBe('function');

  expect(warnSpy).toHaveBeenCalled();

  warnSpy.mockRestore();
});

  it('toggleOpen alterna o estado isOpen', () => {
    const { result } = renderHook(() => useChat(), { wrapper });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('envia mensagem com sucesso e adiciona bolhas de user e assistant', async () => {
    mockedPostAnalyzeAgent.mockResolvedValue({
      response: 'Olá, sou o assistente do LivraMente!',
    });

    const { result } = renderHook(() => useChat(), { wrapper });

    await act(async () => {
      await result.current.sendMessage('Oi, assistente!');
    });

    const { messages, isLoading } = result.current;

    // 1 mensagem de usuário + 1 de assistente
    expect(messages).toHaveLength(2);

    expect(messages[0]).toMatchObject({
      role: 'user',
      content: 'Oi, assistente!',
    });

    expect(messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Olá, sou o assistente do LivraMente!',
    });

    // loading deve ter voltado para false
    expect(isLoading).toBe(false);

    // service foi chamado sem token, só com payload
    expect(mockedPostAnalyzeAgent).toHaveBeenCalledTimes(1);
    expect(mockedPostAnalyzeAgent).toHaveBeenCalledWith({
      userPrompt: 'Oi, assistente!',
    });
  });

  it('adiciona mensagem de erro formatada quando postAnalyzeAgent rejeita', async () => {
    mockedPostAnalyzeAgent.mockRejectedValue(
      new Error('Usuário não autenticado (sessão inválida).'),
    );

    const { result } = renderHook(() => useChat(), { wrapper });

    await act(async () => {
      await result.current.sendMessage('Oi sem sessão');
    });

    const { messages } = result.current;

    // 1 user + 1 assistant (de erro)
    expect(messages).toHaveLength(2);

    expect(messages[0]).toMatchObject({
      role: 'user',
      content: 'Oi sem sessão',
    });

    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe(
      'Ops: Usuário não autenticado (sessão inválida).',
    );

    expect(mockedPostAnalyzeAgent).toHaveBeenCalledTimes(1);
    expect(mockedPostAnalyzeAgent).toHaveBeenCalledWith({
      userPrompt: 'Oi sem sessão',
    });
  });

  it('usa mensagem genérica "Ocorreu um erro." quando a exceção não é Error', async () => {
    // força um erro "não padrão"
    mockedPostAnalyzeAgent.mockRejectedValue('alguma coisa estranha');

    const { result } = renderHook(() => useChat(), { wrapper });

    await act(async () => {
      await result.current.sendMessage('Teste erro genérico');
    });

    const { messages } = result.current;

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('Teste erro genérico');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe('Ops: Ocorreu um erro.');
  });

// ... beforeAll com crypto.randomUUID etc.

it('isLoading fica true durante o envio e volta para false no final', async () => {
    const mockedPostAnalyzeAgent = postAnalyzeAgent as jest.MockedFunction<
        typeof postAnalyzeAgent
    >;

    let resolveFn: (value: any) => void;

    // cria uma promise pendente para controlar quando a resposta chega
    mockedPostAnalyzeAgent.mockImplementation(
        () =>
        new Promise((resolve) => {
            resolveFn = resolve;
        }),
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatProvider>{children}</ChatProvider>
    );

    const { result } = renderHook(() => useChat(), { wrapper });

    // 1) dispara o sendMessage, mas não espera a promise resolver
    act(() => {
        result.current.sendMessage('Mensagem longa...');
    });

    // 2) espera o React aplicar o setIsLoading(true)
    await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
    });

    // 3) agora simulamos o backend respondendo
    act(() => {
        resolveFn!({ response: 'Ok, resposta atrasada.' });
    });

    // 4) espera o finally rodar e o isLoading voltar para false
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    });
    });


  it('resetChat limpa todas as mensagens', async () => {
    mockedPostAnalyzeAgent.mockResolvedValue({
      response: 'Resposta qualquer',
    });

    const { result } = renderHook(() => useChat(), { wrapper });

    await act(async () => {
      await result.current.sendMessage('Primeira mensagem');
    });

    expect(result.current.messages.length).toBeGreaterThan(0);

    act(() => {
      result.current.resetChat();
    });

    expect(result.current.messages).toHaveLength(0);
  });
});
