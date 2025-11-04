import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
let CreateCommunityPage: any;

beforeAll(async () => {
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  window.alert = jest.fn();
  const mod = await import('@/app/comunidades/criar/page');
  CreateCommunityPage = mod.default ?? mod;
});

describe('CreateCommunityPage', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it('renderiza todos os campos do formulário', () => {
    render(<CreateCommunityPage />);
    expect(screen.getByText('Crie sua nova comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Imagem de capa')).toBeInTheDocument();
    expect(screen.getByText('Upload de capa')).toBeInTheDocument();
    expect(screen.getByText('Criar comunidade')).toBeInTheDocument();
  });

  it('valida campos obrigatórios ao enviar', async () => {
    render(<CreateCommunityPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Criar comunidade'));
    });
    await waitFor(() => {
      expect(screen.getByText('O nome é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('A descrição é obrigatória.')).toBeInTheDocument();
      expect(screen.getByText('As tags são obrigatórias.')).toBeInTheDocument();
    });
  });

  it('mostra preview da imagem ao selecionar arquivo', async () => {
    render(<CreateCommunityPage />);
    const input = screen.getByLabelText('Imagem de capa');
    const file = new File(['dummy'], 'capa.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(screen.getByAltText('Prévia')).toBeInTheDocument();
    });
  });
  it('envia dados para o backend ao criar comunidade', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
  render(<CreateCommunityPage />);
  fireEvent.change(screen.getByLabelText('Nome da comunidade'), { target: { value: 'Minha Comunidade' } });
  fireEvent.change(screen.getByLabelText('Descrição da comunidade'), { target: { value: 'Descrição' } });
  const tagsBtn = screen.getByRole('button', { name: 'Tags da comunidade' });
  fireEvent.click(tagsBtn);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
  await act(async () => {
    fireEvent.click(screen.getByText('Criar comunidade'));
  });
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalled();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body;
    if (body && typeof (body as any).get === 'function') {
      const fd = body as FormData;
      expect(fd.get('tags')).toBe('Romance, Aventura');
    } else if (typeof body === 'string') {
      const json = JSON.parse(body as string);
      expect(Array.isArray(json.tags)).toBe(true);
      expect(json.tags).toEqual(expect.arrayContaining(['Romance', 'Aventura']));
    } else {
      throw new Error('Unexpected request body type');
    }
  });
  fetchMock.mockRestore();
  });
  it('mostra erro se o backend falhar', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    render(<CreateCommunityPage />);
    fireEvent.change(screen.getByLabelText('Nome da comunidade'), { target: { value: 'Minha Comunidade' } });
    fireEvent.change(screen.getByLabelText('Descrição da comunidade'), { target: { value: 'Descrição' } });
    const tagsBtn = screen.getByRole('button', { name: 'Tags da comunidade' });
    fireEvent.click(tagsBtn);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
    await act(async () => {
      fireEvent.click(screen.getByText('Criar comunidade'));
    });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao criar comunidade');
    });
    fetchMock.mockRestore();
  });

  it('não envia se houver erro de validação', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    render(<CreateCommunityPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Criar comunidade'));
    });
    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
    });
    fetchMock.mockRestore();
  });

  it('redireciona após criar comunidade com sucesso', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    const routerPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: routerPush });
    render(<CreateCommunityPage />);
    fireEvent.change(screen.getByLabelText('Nome da comunidade'), { target: { value: 'Minha Comunidade' } });
    fireEvent.change(screen.getByLabelText('Descrição da comunidade'), { target: { value: 'Descrição' } });
    const tagsBtn = screen.getByRole('button', { name: 'Tags da comunidade' });
    fireEvent.click(tagsBtn);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
    await act(async () => {
      fireEvent.click(screen.getByText('Criar comunidade'));
    });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Comunidade criada com sucesso!');
    });
    fireEvent.click(screen.getByText('Voltar para comunidades'));
    expect(routerPush).toHaveBeenCalledWith('/comunidades');
    fetchMock.mockRestore();
  });
});