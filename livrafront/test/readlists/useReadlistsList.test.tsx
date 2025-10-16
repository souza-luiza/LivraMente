import { renderHook, waitFor } from '@testing-library/react';
import { useReadlistsList } from '@/hooks/useReadlistsList';

describe('useReadlistsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('retorna readlists após fetch', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              _id: '1',
              nome: 'Minhas 1',
              publica: true,
              criador: { _id: '1', username: 'gatanoturna' },
              livros: [],
            },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    ) as jest.Mock;

    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists[0].nome).toBe('Minhas 1');
    expect(result.current.error).toBeNull();
  });

  it('inicia com loading true e readlists vazio', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.readlists).toEqual([]);
  });

  it('retorna erro se fetch falhar', async () => {
    global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Erro ao buscar readlists do usuário.');
    expect(result.current.readlists).toEqual([]);
  });

  it('usa endpoint de username quando type=criadas', async () => {
    global.fetch = jest.fn((endpoint) => {
      expect(endpoint).toBe('/api/readlists/user/testuser');
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              _id: '2',
              nome: 'Por Username',
              publica: true,
              criador: { _id: '2', username: 'testuser' },
              livros: [],
            },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('testuser', 'criadas'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists[0].nome).toBe('Por Username');
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se resposta não for array', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ foo: 'bar' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se resposta for null', async () => {
    global.fetch = jest.fn(() => Promise.resolve(new Response('null', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retorna lista vazia se resposta for undefined', async () => {
    global.fetch = jest.fn(() => Promise.resolve(new Response('undefined', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBe('Erro ao buscar readlists do usuário.');
  });

  it('retorna lista vazia se resposta for array vazio', async () => {
    global.fetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))) as jest.Mock;
    const { result } = renderHook(() => useReadlistsList('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.readlists).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});