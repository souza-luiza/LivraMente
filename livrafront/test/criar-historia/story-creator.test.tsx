import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateStory from '@/app/criar-historia/story-creator';

// Mock do fetch
global.fetch = jest.fn();

// Mock do scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('CreateStory', () => {
  beforeEach(() => {
    // Limpa o localStorage antes de cada teste
    localStorage.clear();
    // Reseta os mocks
    jest.clearAllMocks();
  });

  it('deve renderizar o título e sugestões iniciais', () => {
    render(<CreateStory />);
    
    expect(screen.getByText('Criador de Histórias')).toBeInTheDocument();
    expect(screen.getByText('Comece a criar a sua história!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Descreva sua ideia de história/i)).toBeInTheDocument();
  });

  it('deve exibir 4 sugestões aleatórias', () => {
    render(<CreateStory />);
    
    const buttons = screen.getAllByRole('button');
    // Filtra apenas os botões de sugestão (exclui botão de enviar e nova história)
    const suggestionButtons = buttons.filter(btn => 
      btn.textContent?.includes('Escreva') || 
      btn.textContent?.includes('Crie') || 
      btn.textContent?.includes('Conte') ||
      btn.textContent?.includes('Desenvolva') ||
      btn.textContent?.includes('Elabore') ||
      btn.textContent?.includes('Invente') ||
      btn.textContent?.includes('Descreva') ||
      btn.textContent?.includes('Imagine')
    );
    
    expect(suggestionButtons).toHaveLength(4);
  });

  it('deve preencher o input ao clicar em uma sugestão', async () => {
    render(<CreateStory />);

    // pega todos os botões de sugestão (eles sempre existem no início)
    const suggestionButtons = await screen.findAllByRole('button', {
      name: /Escreva|Crie|Conte|Desenvolva|Elabore|Invente|Descreva|Imagine/i,
    });

    // clica na primeira sugestão
    await userEvent.click(suggestionButtons[0]);

    // verifica que o textarea recebeu algum valor
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i) as HTMLTextAreaElement;
    expect(textarea.value).not.toBe('');
  });




  it('deve enviar mensagem ao clicar no botão de enviar', async () => {
    const mockResponse = {
      storyId: 'story-123',
      textoCapitulo: 'Era uma vez...',
      novasOpcoes: [
        { id: 1, texto: 'Opção 1' },
        { id: 2, texto: 'Opção 2' }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Minha história');
    
    // Aguarda o botão estar habilitado
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });

      expect(sendButton).toBeDefined();
    });

    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/llm/gerar',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userWriting: 'Minha história', storyId: null })
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Era uma vez...')).toBeInTheDocument();
    });
  });

  it('deve enviar mensagem ao pressionar Enter', async () => {
    const mockResponse = {
      storyId: 'story-123',
      textoCapitulo: 'Resposta da IA',
      novasOpcoes: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Teste');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('não deve enviar ao pressionar Shift+Enter', async () => {
    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Linha 1');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(textarea, 'Linha 2');

    expect(global.fetch).not.toHaveBeenCalled();
    expect((textarea as HTMLTextAreaElement).value).toContain('\n');
  });

  it('deve exibir opções após receber resposta', async () => {
    const mockResponse = {
      storyId: 'story-123',
      textoCapitulo: 'História gerada',
      novasOpcoes: [
        { id: 1, texto: 'Primeira opção' },
        { id: 2, texto: 'Segunda opção' }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Teste');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });

    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText('História gerada')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Primeira opção')).toBeInTheDocument();
      expect(screen.getByText('Segunda opção')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro ao falhar', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Erro de rede'));

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Teste');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Ops, algo deu errado/i)).toBeInTheDocument();
    });
  });

  it('deve salvar rascunho no localStorage', async () => {
    const mockResponse = {
      storyId: 'story-123',
      textoCapitulo: 'Texto salvo',
      novasOpcoes: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Rascunho');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Texto salvo')).toBeInTheDocument();
    });

    await waitFor(() => {
      const draft = localStorage.getItem('storyDraft');
      expect(draft).toBeTruthy();
      if (draft) {
        const parsed = JSON.parse(draft);
        expect(parsed.storyId).toBe('story-123');
        expect(parsed.messages).toHaveLength(2);
      }
    });
  });

  it('deve carregar rascunho do localStorage', () => {
    const draft = {
      messages: [
        { role: 'user', content: 'Mensagem salva' },
        { role: 'assistant', content: 'Resposta salva' }
      ],
      opcoes: [{ id: 1, texto: 'Opção salva' }],
      storyId: 'story-saved'
    };

    localStorage.setItem('storyDraft', JSON.stringify(draft));

    render(<CreateStory />);

    expect(screen.getByText('Mensagem salva')).toBeInTheDocument();
    expect(screen.getByText('Resposta salva')).toBeInTheDocument();
    expect(screen.getByText('Opção salva')).toBeInTheDocument();
  });

  it('deve limpar tudo ao clicar em Nova História', async () => {
    const draft = {
      messages: [{ role: 'user', content: 'Mensagem antiga' }],
      opcoes: [],
      storyId: 'story-old'
    };

    localStorage.setItem('storyDraft', JSON.stringify(draft));

    render(<CreateStory />);

    const newStoryButton = screen.getByText('Nova História');
    await userEvent.click(newStoryButton);

    await waitFor(() => {
      expect(localStorage.getItem('storyDraft')).toBeNull();
      expect(screen.queryByText('Mensagem antiga')).not.toBeInTheDocument();
    });
  });

  it('deve desabilitar input e botão durante carregamento', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(promise);

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Teste');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Pensando')).toBeInTheDocument();
    });

    const textareaAfterClick = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    expect(textareaAfterClick).toBeDisabled();

    // Limpa a promise
    resolvePromise({
      ok: true,
      json: async () => ({ storyId: 'test', textoCapitulo: 'Test', novasOpcoes: [] })
    });
  });

  it('deve enviar opção ao clicar nela', async () => {
    const mockResponse1 = {
      storyId: 'story-123',
      textoCapitulo: 'Primeira resposta',
      novasOpcoes: [
        { id: 1, texto: 'Opção escolhida' }
      ]
    };

    const mockResponse2 = {
      storyId: 'story-123',
      textoCapitulo: 'Segunda resposta',
      novasOpcoes: []
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2
      });

    render(<CreateStory />);
    
    const textarea = screen.getByPlaceholderText(/Descreva sua ideia de história/i);
    await userEvent.type(textarea, 'Início');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    
    if (sendButton) {
      await userEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Primeira resposta')).toBeInTheDocument();
    });

    const optionButton = await screen.findByText('Opção escolhida');
    await userEvent.click(optionButton);

    await waitFor(() => {
      expect(screen.getByText('Segunda resposta')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3001/llm/gerar',
      expect.objectContaining({
        body: JSON.stringify({ userWriting: 'Opção escolhida', storyId: 'story-123' })
      })
    );
  });
});