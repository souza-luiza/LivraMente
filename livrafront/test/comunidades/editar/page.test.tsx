import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '@/app/comunidade/[community]/editar/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => 'comunidade-teste' }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      nome: 'Comunidade Teste',
      descricao: 'Descrição Teste',
      tags: ['tag1', 'tag2'],
      imagem_url: 'url-imagem',
      moderadores: ['user-id'],
    }),
  })
) as jest.Mock;

jest.mock('@/components/sidebar', () => () => <div data-testid="sidebar" />);
jest.mock('@/components/loading', () => () => <div data-testid="loading" />);

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'fake-url');
});

describe('EditarComunidadePage', () => {
  beforeEach(() => {
    localStorage.setItem('userId', 'user-id');
    jest.clearAllMocks();
  });

  it('renderiza o formulário com dados carregados', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição Teste')).toBeInTheDocument();
  expect(screen.getByText('tag1')).toBeInTheDocument();
  expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('valida campos obrigatórios', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Digite o nome da comunidade'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('Digite a descrição da comunidade'), { target: { value: '' } });
    const tagsBtn = screen.getByRole('button', { name: 'Tags da comunidade' });
    fireEvent.click(tagsBtn);
    fireEvent.click(screen.getByRole('checkbox', { name: 'tag1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'tag2' }));
    fireEvent.click(screen.getByText('Salvar alterações'));
    expect(await screen.findByText('O nome é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('A descrição é obrigatória.')).toBeInTheDocument();
    expect(screen.getByText('As tags são obrigatórias.')).toBeInTheDocument();
  });

  it('mostra mensagem de sucesso ao editar', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Salvar alterações'));
    await waitFor(() => {
      expect(screen.getByText('Comunidade editada com sucesso!')).toBeInTheDocument();
    });
  });

  it('mostra mensagem de erro se não for moderador', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          nome: 'Comunidade Teste',
          descricao: 'Descrição Teste',
          tags: ['tag1', 'tag2'],
          imagem_url: 'url-imagem',
          moderadores: ['outro-id'],
        }),
      })
    );
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Apenas moderadores podem editar esta comunidade.')).toBeInTheDocument();
    });
  });
  it('renderiza loading enquanto carrega', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  render(<Page />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
});

it('mostra mensagem de erro ao falhar no fetch', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false }));
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByText('Erro ao carregar comunidade')).toBeInTheDocument();
  });
});
it('mostra preview da imagem ao selecionar arquivo', async () => {
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  const file = new File(['dummy'], 'foto.png', { type: 'image/png' });
  const input = screen.getByLabelText('Imagem de capa');
  fireEvent.change(input, { target: { files: [file] } });
  // O preview é uma imagem
  await waitFor(() => {
    expect(screen.getByAltText('Prévia')).toBeInTheDocument();
  });
});

it('aciona input de upload ao clicar no botão', async () => {
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  const uploadBtn = screen.getByText('Upload de capa');
  const input = screen.getByLabelText('Imagem de capa');
  const spy = jest.spyOn(input, 'click');
  fireEvent.click(uploadBtn);
  expect(spy).toHaveBeenCalled();
});

it('mostra mensagem de erro ao falhar no PATCH', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        nome: 'Comunidade Teste',
        descricao: 'Descrição Teste',
        tags: ['tag1', 'tag2'],
        imagem_url: 'url-imagem',
        moderadores: ['user-id'],
      }),
    })
  );
  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: false })
  );
  render(<Page />);
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('Salvar alterações'));
  await waitFor(() => {
    expect(screen.getByText(/Erro ao editar comunidade/i)).toBeInTheDocument();
  });
});

it('não envia se houver erro de validação', async () => {
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  fireEvent.change(screen.getByPlaceholderText('Digite o nome da comunidade'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Salvar alterações'));
  expect(global.fetch).toHaveBeenCalledTimes(1); 
});
it('envia dados para o backend ao editar comunidade', async () => {
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  fireEvent.change(screen.getByPlaceholderText('Digite o nome da comunidade'), { target: { value: 'Novo Nome' } });
  fireEvent.change(screen.getByPlaceholderText('Digite a descrição da comunidade'), { target: { value: 'Nova Descrição' } });
  const tagsBtn = screen.getByRole('button', { name: 'Tags da comunidade' });
  fireEvent.click(tagsBtn);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Fantasia' }));
  fireEvent.click(screen.getByText('Salvar alterações'));
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
    const init = (global.fetch as jest.Mock).mock.calls[1][1] as RequestInit;
    const body = init.body;
    if (body && typeof (body as any).get === 'function') {
      const fd = body as FormData;
      const tagsSent = String(fd.get('tags'));
      expect(tagsSent).toEqual(expect.stringContaining('Romance'));
      expect(tagsSent).toEqual(expect.stringContaining('Fantasia'));
    } else if (typeof body === 'string') {
      const json = JSON.parse(body as string);
      expect(Array.isArray(json.tags)).toBe(true);
      expect(json.tags).toEqual(expect.arrayContaining(['Romance', 'Fantasia']));
    } else {
      throw new Error('Unexpected request body type');
    }
  });
});
it('redireciona para /comunidades ao clicar no botão de voltar', async () => {
  const mockPush = jest.fn();
  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByDisplayValue('Comunidade Teste')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('Salvar alterações'));
  await waitFor(() => {
    expect(screen.getByText('Comunidade editada com sucesso!')).toBeInTheDocument();
  });
  const voltarBtn = await screen.findByRole('button', { name: 'Voltar para comunidades' });
  fireEvent.click(voltarBtn);
  expect(mockPush).toHaveBeenCalledWith('/comunidades/comunidade-teste');

  // Erro
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false }));
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByText('Erro ao carregar comunidade')).toBeInTheDocument();
  });
  const voltarBtnErro = await screen.findByRole('button', { name: 'Voltar' });
  fireEvent.click(voltarBtnErro);
  expect(mockPush).toHaveBeenCalledWith('/comunidades/comunidade-teste');
});
});
