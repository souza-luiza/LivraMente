import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WidgetChat from '@/components/widget-chat';
import { ChatProvider } from '@/contexts/chat-context';
import { postAnalyzeAgent } from '@/services/llm';

jest.mock('@/services/llm', () => ({
  postAnalyzeAgent: jest.fn(),
}));

// polyfill simples do crypto.randomUUID para ambiente de teste
beforeAll(() => {
  if (!('crypto' in global)) {
    (global as any).crypto = {};
  }
  if (!(global.crypto as any).randomUUID) {
    (global.crypto as any).randomUUID = () => 'test-id';
  }
});

describe('WidgetChat', () => {
  beforeEach(() => {
    (postAnalyzeAgent as jest.Mock).mockReset();
  });

  function renderWithProvider() {
    return render(
      <ChatProvider>
        <WidgetChat />
      </ChatProvider>,
    );
  }

  it('abre e fecha o chat ao clicar no botão flutuante', async () => {
    renderWithProvider();

    // estado inicial: apenas botão "Abrir chat"
    const openButton = screen.getByRole('button', { name: /assistente/i });
    expect(openButton).toBeInTheDocument();

    // clica para abrir
    fireEvent.click(openButton);

    // header do chat deve aparecer
    expect(
      screen.getByRole('dialog', { name: /Widget de atendimento LivraMente/i }),
    ).toBeInTheDocument();

    // botão agora tem aria-label "Fechar chat"
    const closeButton = screen.getByRole('button', { name: /fechar/i });
    expect(closeButton).toBeInTheDocument();

    // clica para fechar
    fireEvent.click(closeButton);

    // 🔥 IMPORTANTE: esperar o AnimatePresence desmontar o componente
    await waitFor(() => {
        expect(
        screen.queryByText(/Assistente LivraMente/i),
        ).not.toBeInTheDocument();
    });
    });

  it('envia mensagem e exibe bolhas de usuário e assistente quando o backend responde com sucesso', async () => {
    (postAnalyzeAgent as jest.Mock).mockResolvedValue({
      response: 'Olá, posso ajudar com suas leituras!',
    });

    renderWithProvider();

    // abre o chat
    fireEvent.click(screen.getByRole('button', { name: /assistente/i }));

    const input = screen.getByPlaceholderText(/escreva aqui/i);
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    // digita mensagem
    fireEvent.change(input, { target: { value: 'Oi, assistente!' } });

    // clica em enviar
    fireEvent.click(sendButton);

    // bolha do usuário
    await waitFor(() => {
      expect(
        screen.getByText('Oi, assistente!'),
      ).toBeInTheDocument();
    });

    // bolha do assistente com resposta mockada
    await waitFor(() => {
      expect(
        screen.getByText('Olá, posso ajudar com suas leituras!'),
      ).toBeInTheDocument();
    });

    // garante que o serviço foi chamado corretamente (sem token)
    expect(postAnalyzeAgent).toHaveBeenCalledWith({
      userPrompt: 'Oi, assistente!',
    });
  });

  it('exibe mensagem de erro formatada quando o backend lança erro (ex.: usuário não autenticado)', async () => {
    (postAnalyzeAgent as jest.Mock).mockRejectedValue(
      new Error('Usuário não autenticado (sessão inválida).'),
    );

    renderWithProvider();

    // abre o chat
    fireEvent.click(screen.getByRole('button', { name: /assistente/i }));

    const input = screen.getByPlaceholderText(/escreva aqui/i);
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, { target: { value: 'Oi sem sessão' } });
    fireEvent.click(sendButton);

    // bolha do usuário
    await waitFor(() => {
      expect(screen.getByText('Oi sem sessão')).toBeInTheDocument();
    });

    // bolha de erro vinda do catch: `Ops: ${error.message}`
    await waitFor(() => {
      expect(
        screen.getByText('Ops: Usuário não autenticado (sessão inválida).'),
      ).toBeInTheDocument();
    });

    expect(postAnalyzeAgent).toHaveBeenCalledWith({
      userPrompt: 'Oi sem sessão',
    });
  });
});
