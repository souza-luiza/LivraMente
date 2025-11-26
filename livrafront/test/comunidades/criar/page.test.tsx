import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// Mock TagsDropdown to provide predictable checkboxes for tests
jest.mock('@/components/tags-dropdown', () => ({
  __esModule: true,
  default: ({ selectedTags, setSelectedTags }: any) => (
    <div>
      <button aria-label="tags-button">Tags</button>
      <label>
        <input
          type="checkbox"
          role="checkbox"
          name="Romance"
          onClick={() => setSelectedTags([...(selectedTags || []), 'romance'])}
        />
        Romance
      </label>
      <label>
        <input
          type="checkbox"
          role="checkbox"
          name="Aventura"
          onClick={() => setSelectedTags([...(selectedTags || []), 'aventura'])}
        />
        Aventura
      </label>
    </div>
  )
}));
// Mock next/image to avoid DOM warnings about non-standard attributes like `fill`
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { alt, src } = props;
    return React.createElement('img', { alt, src: typeof src === 'string' ? src : '' });
  }
}));

// Mock communityService so tests don't rely on global fetch and can assert calls directly
jest.mock('@/services/comunidade', () => ({
  __esModule: true,
  communityService: {
    createCommunity: jest.fn(),
    uploadImage: jest.fn(),
  }
}));
let CreateCommunityPage: any;

beforeAll(async () => {
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  window.alert = jest.fn();
  const mod = await import('@/app/comunidades/criar/page');
  CreateCommunityPage = mod.default ?? mod;
});

describe('CreateCommunityPage', () => {
  beforeAll(() => {
    // no fake timers — let async flows run normally during tests
  });
  it('renderiza todos os campos do formulário', () => {
    render(<CreateCommunityPage />);
    expect(screen.getByRole('heading', { name: /criar comunidade/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/imagem/i)).toBeInTheDocument();
    expect(screen.getByText(/Fazer Upload|Upload/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
  });

  it('valida campos obrigatórios ao enviar', async () => {
    render(<CreateCommunityPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /criar/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('O nome é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('As tags são obrigatórias.')).toBeInTheDocument();
    });
  });

  it('mostra preview da imagem ao selecionar arquivo', async () => {
    render(<CreateCommunityPage />);
    const input = screen.getByLabelText(/imagem/i);
    const file = new File(['dummy'], 'capa.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(screen.getByAltText('Prévia')).toBeInTheDocument();
    });
  });
  it('envia dados para o backend ao criar comunidade', async () => {
  const { communityService } = require('@/services/comunidade');
  (communityService.createCommunity as jest.Mock).mockResolvedValue({});
  render(<CreateCommunityPage />);
  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Minha Comunidade' } });
  fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: 'Descrição' } });
  const tagsBtn = screen.getByRole('button', { name: /tags/i });
  fireEvent.click(tagsBtn);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /criar/i }));
  });
  await waitFor(() => {
    expect(communityService.createCommunity).toHaveBeenCalled();
    const payload = (communityService.createCommunity as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(payload.tags)).toBe(true);
    expect(payload.tags).toEqual(expect.arrayContaining(['romance', 'aventura']));
  });
  (communityService.createCommunity as jest.Mock).mockRestore?.();
  });
  it('mostra erro se o backend falhar', async () => {
    const { communityService } = require('@/services/comunidade');
    (communityService.createCommunity as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<CreateCommunityPage />);
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Minha Comunidade' } });
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: 'Descrição' } });
    const tagsBtn = screen.getByRole('button', { name: /tags/i });
    fireEvent.click(tagsBtn);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /criar/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/Erro ao criar comunidade/i)).toBeInTheDocument();
    });
    (communityService.createCommunity as jest.Mock).mockRestore?.();
  });

  it('não envia se houver erro de validação', async () => {
    const { communityService } = require('@/services/comunidade');
    (communityService.createCommunity as jest.Mock).mockClear();
    render(<CreateCommunityPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /criar/i }));
    });
    await waitFor(() => {
      // createCommunity should not be called when validation fails
      expect(communityService.createCommunity).not.toHaveBeenCalled();
    });
  });

  it('redireciona após criar comunidade com sucesso', async () => {
    const { communityService } = require('@/services/comunidade');
    (communityService.createCommunity as jest.Mock).mockResolvedValue({});
    const routerPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: routerPush });
    render(<CreateCommunityPage />);
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Minha Comunidade' } });
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: 'Descrição' } });
    const tagsBtn = screen.getByRole('button', { name: /tags/i });
    fireEvent.click(tagsBtn);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Romance' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aventura' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /criar/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/Comunidade criada com sucesso/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /voltar para comunidades/i }));
    expect(routerPush).toHaveBeenCalledWith('/comunidades');
    (communityService.createCommunity as jest.Mock).mockRestore?.();
  });
});