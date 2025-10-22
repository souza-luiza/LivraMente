global.alert = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    assign: jest.fn(),
    replace: jest.fn(),
  },
});
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReadlistsPage from '../../src/app/[username]/readlists/page';
import { useReadlistsList } from '../../src/hooks/useReadlistsList';

jest.mock('../../src/hooks/useReadlistsList');
const mockUseReadlistsList = useReadlistsList as jest.Mock;

jest.mock('next/navigation', () => ({
  useParams: () => ({ username: (global as any).__TEST_ROUTE_USERNAME__ || '1' })
}));

describe('ReadlistsPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => '1' },
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
    (global as any).__TEST_ROUTE_USERNAME__ = undefined;
  });

  it('fetches username for other user page', async () => {
    // simulate visiting /otherUser
    (global as any).__TEST_ROUTE_USERNAME__ = 'otherUser';
    mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
    render(<ReadlistsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Readlists de otherUser/i)).toBeInTheDocument();
    });
  });

  it('opens modal and calls onCreate', async () => {
    mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
    render(<ReadlistsPage />);
    const criarBtn = screen.getByRole('button', { name: /criar readlist/i });
    await act(async () => {
      fireEvent.click(criarBtn);
    });
    expect(screen.getAllByText(/Criar Readlist/i).length).toBeGreaterThan(0);
    // Simulate create
    const radio = screen.getByLabelText(/Pública/i);
    fireEvent.click(radio);
    // Try by placeholder first, fallback to label
    let nomeInput;
    try {
      nomeInput = screen.getByPlaceholderText(/Nome da readlist/i);
    } catch {
      nomeInput = screen.getByLabelText(/Nome da readlist/i);
    }
    fireEvent.change(nomeInput, { target: { value: 'Nova Readlist' } });
    const criarModalBtn = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(criarModalBtn);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('switches tabs and fetches favorited readlists', async () => {
    mockUseReadlistsList.mockReturnValue({
      readlists: [
        { _id: '1', nome: 'Minhas', criador: { _id: '1', username: 'eu' }, livros: [], favoritadoPor: [], publica: true, descricao: '', createdAt: '' },
      ],
      loading: false,
      error: null,
    });
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify([
        {
          _id: '99',
          nome: 'Favoritada',
          criador: { _id: '2', username: 'outro' },
          livros: [],
          favoritadoPor: ['1'],
          publica: true,
          descricao: '',
          createdAt: '',
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    ) as jest.Mock;
    await act(async () => {
      render(<ReadlistsPage />);
    });
    const favoritasBtn = screen.getByRole('button', { name: /favoritadas/i });
    await act(async () => {
      fireEvent.click(favoritasBtn);
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Favoritada/i).length).toBeGreaterThan(1);
    });
  });

  it('shows error and empty states', () => {
    mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: 'Erro ao carregar readlists' });
    render(<ReadlistsPage />);
    expect(screen.getByText('Erro ao carregar readlists')).toBeInTheDocument();
    mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
    render(<ReadlistsPage />);
    expect(screen.getByText(/Nenhuma readlist encontrada/i)).toBeInTheDocument();
  });
});
