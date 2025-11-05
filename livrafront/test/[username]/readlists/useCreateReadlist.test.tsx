import { renderHook, act } from '@testing-library/react';
import { useCreateReadlist } from '@/hooks/useCreateReadlist';

const localStorageMock = {
  getItem: jest.fn((key: string) => {
    if (key === 'token') return 'fake-token';
    if (key === 'userId') return '1';
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useCreateReadlist', () => {
  beforeEach(() => {
    // Reset apenas o fetch, não o localStorage
    if (global.fetch) {
      (global.fetch as jest.Mock).mockClear();
    }
    // Re-configurar o mock do getItem se necessário
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'fake-token';
      if (key === 'userId') return '1';
      return null;
    });
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
    const mockResponse = { _id: 'r1', nome: 'Nova Readlist', publica: true, favorito: false, criador: { _id: '1' }, livros: [] };
    
    // Mock fetch com Response que inclui text() para caso de erro
    const mockFetch = jest.fn(() => {
      const response = new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      // Garantir que text() está disponível
      (response as any).text = jest.fn(() => Promise.resolve(JSON.stringify(mockResponse)));
      return Promise.resolve(response);
    });
    
    global.fetch = mockFetch as jest.Mock;
    
    let added: any = null;
    let errorMsg: string = '';
    let result: any;
    const rh = renderHook(() => useCreateReadlist());
    result = rh.result;
    
    await act(async () => {
      await (result.current.handleCreateReadlist as any)(
        { nome: 'Nova Readlist', descricao: 'Descrição de teste', publica: true }, 
        (m: string) => { errorMsg = m; },
        (rl: any) => { added = rl; }
      );
    });
    
    // Se houver erro de validação, o teste deve falhar com mensagem clara
    expect(errorMsg).toBe('');
    
    expect(mockFetch).toHaveBeenCalled();
    expect(added).toEqual(mockResponse);
  });
});