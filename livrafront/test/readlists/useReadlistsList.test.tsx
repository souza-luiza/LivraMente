global.alert = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    assign: jest.fn(),
    replace: jest.fn(),
  },
});
jest.mock('@/services/readlists', () => ({
  __esModule: true,
  ...jest.requireActual('@/services/readlists'),
  getOwnReadlists: jest.fn(),
  getFavoriteReadlists: jest.fn(),
  getPublicReadlists: jest.fn(),
}));

import { renderHook, waitFor, act } from '@testing-library/react';
import { useReadlistsList } from '@/hooks/useReadlistsList';

// Dados e mocks globais
const mockUser = {
  _id: '1',
  username: 'gatanoturna',
};

const user1Readlists = [
  {
    _id: '1',
    nome: 'Minhas 1',
    publica: true,
    favorito: false,
    criador: { _id: '1', username: 'gatanoturna' },
    livros: [],
  },
  {
    _id: '3',
    nome: 'Favoritada',
    publica: true,
    favorito: true,
    criador: { _id: '1', username: 'gatanoturna' },
    livros: [],
  },
];

const user2Readlists = [
  {
    _id: '2',
    nome: 'Por Username',
    publica: true,
    favorito: false,
    criador: { _id: '2', username: 'testuser' },
    livros: [],
  },
];

// (Remove top-level beforeEach)
describe('useReadlistsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => {
          if (key === 'userId') return '1';
          if (key === 'token') return 'fake-token';
          if (key === 'user') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('retorna readlists do usuário logado', async () => {
    (require('@/services/readlists').getOwnReadlists as jest.Mock).mockResolvedValue(user1Readlists);
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.readlists).not.toEqual([]));
    expect(result.current.readlists).toEqual(user1Readlists);
    expect(result.current.error).toBeNull();
  });

  it('retorna readlists favoritadas', async () => {
    (require('@/services/readlists').getFavoriteReadlists as jest.Mock).mockResolvedValue([user1Readlists[1]]);
    const { result } = renderHook(() => useReadlistsList('1', 'favoritadas'));
    await waitFor(() => expect(result.current.readlists).not.toEqual([]));
    expect(result.current.readlists).toEqual([user1Readlists[1]]);
    expect(result.current.error).toBeNull();
  });

  it('mostra loading true enquanto busca', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useReadlistsList('1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.readlists).toEqual([]);
  });


  it('retorna lista vazia se serviço retorna objeto', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ foo: 'bar' }),
    });
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => result.current.loading === false);
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se serviço retorna null', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => null,
    });
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => result.current.loading === false);
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se serviço retorna undefined', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => undefined,
    });
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => result.current.loading === false);
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se serviço retorna array vazio', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => result.current.loading === false);
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

// Isolated error test
describe('useReadlistsList erro ao buscar readlists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => {
          if (key === 'userId') return '1';
          if (key === 'token') return 'fake-token';
          if (key === 'user') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    (require('@/services/readlists').getOwnReadlists as jest.Mock).mockRejectedValueOnce(new Error('Erro ao buscar suas readlists'));
  });
  it('retorna erro se serviço falhar', async () => {
    const { result } = renderHook(() => useReadlistsList('1'));
    await act(async () => {
      await waitFor(() => result.current.error !== null, { timeout: 2000 });
    });
    console.log('DEBUG error:', result.current.error);
    expect(result.current.error).toBe('Erro ao buscar suas readlists');
  expect(result.current.readlists).toEqual([]);
});
});