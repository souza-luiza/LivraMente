import { renderHook, act } from '@testing-library/react';
import { useCreateReadlist } from '@/hooks/useCreateReadlist';

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => {
      if (key === 'token') return 'fake-token';
      if (key === 'userId') return '1';
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('useCreateReadlist', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('validates payload with Zod and returns validation error', async () => {
    let errorMsg = '';
    let result: any;
    const rh = renderHook(() => useCreateReadlist());
    result = rh.result;
    await act(async () => {
      await (result.current.handleCreateReadlist as any)({ nome: '', descricao: '', publica: true }, (m: string) => { errorMsg = m; });
    });
    expect(errorMsg).toMatch(/Título/);
  });

  it('creates readlist and calls addToList on success', async () => {
    const mockResponse = { _id: 'r1', nome: 'Nova', publica: true, favorito: false, criador: { _id: '1' }, livros: [] };
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })) as jest.Mock;
    let added: any = null;
    let result: any;
    const rh = renderHook(() => useCreateReadlist());
    result = rh.result;
    await act(async () => {
      await (result.current.handleCreateReadlist as any)({ nome: 'Nova', descricao: '', publica: true }, undefined, (rl: any) => { added = rl; });
    });
    expect(added).toEqual(mockResponse);
  });
});