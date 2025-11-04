import {
  getPublicReadlists,
  getOwnReadlists,
  getFavoriteReadlists,
  favoriteReadlist,
  unfavoriteReadlist
} from '@/services/readlists';

const mockReadlist = {
  _id: '1',
  nome: 'Favoritos',
  favorito: true,
  publica: true,
  descricao: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  capa_url: '/kemi-teste.jpg',
  criador: { _id: '1', username: 'gatanoturna' },
  livros: ['livro1', 'livro2'],
  favoritadoPor: ['user1', 'user2', 'user3'],
  createdAt: '2025-10-01',
  updatedAt: '2025-10-02',
};

describe('readlists service endpoints', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      clear: () => { store = {}; },
      removeItem: (key: string) => { delete store[key]; }
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  beforeEach(() => {
    jest.resetAllMocks();
    localStorageMock.setItem('token', 'test-token-123');
  });

  afterEach(() => {
    localStorageMock.clear();
  });


  it('getPublicReadlists faz fetch correto e retorna dados', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify([mockReadlist]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    ) as jest.Mock;
    const result = await getPublicReadlists('1');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/readlists/public/1'), expect.any(Object));
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Favoritos');
  });

  it('getOwnReadlists faz fetch correto e retorna dados', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify([mockReadlist]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    ) as jest.Mock;
    const result = await getOwnReadlists();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/readlists'), expect.any(Object));
    expect(result).toHaveLength(1);
  });

  it('getFavoriteReadlists faz fetch correto e retorna dados', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify([mockReadlist]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    ) as jest.Mock;
    const result = await getFavoriteReadlists();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/me/favoritar'), expect.any(Object));
    expect(result).toHaveLength(1);
  });

  it('favoriteReadlist faz fetch PATCH e retorna dados', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    ) as jest.Mock;
    const result = await favoriteReadlist('readlist1');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/me/favoritar/readlist1'), expect.objectContaining({ method: 'PATCH' }));
    expect(result.success).toBe(true);
  });

  it('unfavoriteReadlist faz fetch DELETE e retorna dados', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    ) as jest.Mock;
    const result = await unfavoriteReadlist('readlist1');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/me/favoritar/readlist1'), expect.objectContaining({ method: 'DELETE' }));
    expect(result.success).toBe(true);
  });


  it('getPublicReadlists lança erro de não autorizado', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('', { status: 401 }))
    ) as jest.Mock;
    await expect(getPublicReadlists('1')).rejects.toThrow('Erro ao buscar readlists públicas');
  });

  it('getPublicReadlists lança erro interno do servidor', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('', { status: 500 }))
    ) as jest.Mock;
    await expect(getPublicReadlists('1')).rejects.toThrow('Erro ao buscar readlists públicas');
  });

  it('getPublicReadlists lança erro genérico', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('', { status: 404 }))
    ) as jest.Mock;
    await expect(getPublicReadlists('1')).rejects.toThrow('Usuário não encontrado');
  });

  it('getPublicReadlists lança erro em caso de exceção', async () => {
    global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
    await expect(getPublicReadlists('1')).rejects.toBeDefined();
  });
});
