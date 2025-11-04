import {
  getOwnReadlists,
  getPublicReadlists,
  getReadlistById,
  createReadlist,
  updateReadlist,
  deleteReadlist,
  addBookToReadlist,
  removeBookFromReadlist,
  getFavoriteReadlists,
  favoriteReadlist,
  unfavoriteReadlist
} from '@/services/readlists';
import { Readlist, ReadlistDetailResponse } from '@/types/readlist';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Readlist Services', () => {
  const mockToken = 'test-token-123';
  const API_BASE_URL = 'http://localhost:3001';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('token', mockToken);
  });

  describe('getOwnReadlists', () => {
    it('should fetch user readlists successfully', async () => {
      const mockReadlists: Readlist[] = [
        {
          _id: '1',
          nome: 'Favoritos',
          favorito: true,
          publica: true,
          criador: { _id: 'user-1', username: 'testuser' },
          livros: []
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadlists
      });

      const result = await getOwnReadlists();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockReadlists);
    });

    it('should throw error when not authenticated', async () => {
      localStorageMock.clear();

      await expect(getOwnReadlists()).rejects.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(getOwnReadlists()).rejects.toThrow();
    });
  });

  describe('getPublicReadlists', () => {
    const username = 'testuser';

    it('should fetch public readlists successfully', async () => {
      const mockReadlists: Readlist[] = [
        {
          _id: '1',
          nome: 'Públicas',
          favorito: false,
          publica: true,
          criador: { _id: 'user-1', username: 'testuser' },
          livros: []
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadlists
      });

      const result = await getPublicReadlists(username);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/public/${username}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockReadlists);
    });

    it('should throw error when user not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getPublicReadlists(username)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getReadlistById', () => {
    const readlistId = 'readlist-123';

    it('should fetch readlist details successfully', async () => {
      const mockReadlist: ReadlistDetailResponse = {
        _id: readlistId,
        nome: 'Detalhes',
        favorito: false,
        publica: true,
        criador: { _id: 'user-1', username: 'testuser' },
        livros: [
          {
            _id: '1',
            titulo: 'Book 1',
            isbn: '123456789',
            autores: [],
            ano_publicacao: 2024,
            numero_paginas: 300,
            capa_url: '/cover.jpg',
            avaliacoes_media: 5
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadlist
      });

      const result = await getReadlistById(readlistId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/${readlistId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockReadlist);
    });

    it('should throw error when readlist not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getReadlistById(readlistId)).rejects.toThrow('Readlist não encontrada');
    });

    it('should throw error on invalid ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(getReadlistById(readlistId)).rejects.toThrow('ID inválido');
    });
  });

  describe('createReadlist', () => {
    it('should create readlist successfully', async () => {
      const createData = {
        nome: 'Nova Readlist',
        descricao: 'Descrição',
        publica: true
      };

      const mockResponse: Readlist = {
        _id: 'new-id',
        nome: createData.nome,
        descricao: createData.descricao,
        publica: createData.publica,
        favorito: false,
        criador: { _id: 'user-1', username: 'testuser' },
        livros: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await createReadlist(createData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify(createData)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(createReadlist({ nome: '', publica: false })).rejects.toThrow();
    });
  });

  describe('updateReadlist', () => {
    const readlistId = 'readlist-123';

    it('should update readlist successfully', async () => {
      const updateData = {
        nome: 'Nome Atualizado',
        descricao: 'Descrição Atualizada'
      };

      const mockResponse: Readlist = {
        _id: readlistId,
        nome: updateData.nome,
        descricao: updateData.descricao,
        favorito: false,
        publica: true,
        criador: { _id: 'user-1', username: 'testuser' },
        livros: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await updateReadlist(readlistId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/${readlistId}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when readlist not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(updateReadlist(readlistId, {})).rejects.toThrow('Readlist não encontrada');
    });
  });

  describe('deleteReadlist', () => {
    const readlistId = 'readlist-123';

    it('should delete readlist successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await deleteReadlist(readlistId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/${readlistId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should throw error when readlist not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(deleteReadlist(readlistId)).rejects.toThrow('Readlist não encontrada');
    });
  });

  describe('addBookToReadlist', () => {
    const readlistId = 'readlist-123';
    const livroId = 'book-456';

    it('should add book successfully', async () => {
      const mockResponse: Readlist = {
        _id: readlistId,
        nome: 'Test',
        favorito: false,
        publica: true,
        criador: { _id: 'user-1', username: 'testuser' },
        livros: [livroId]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await addBookToReadlist(readlistId, livroId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`,
        expect.objectContaining({
          method: 'PATCH'
        })
      );
      expect(result.livros).toContain(livroId);
    });

    it('should throw error when book or readlist not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(addBookToReadlist(readlistId, livroId)).rejects.toThrow('Readlist ou livro não encontrado');
    });
  });

  describe('removeBookFromReadlist', () => {
    const readlistId = 'readlist-123';
    const livroId = 'book-456';

    it('should remove book successfully', async () => {
      const mockResponse: Readlist = {
        _id: readlistId,
        nome: 'Test',
        favorito: false,
        publica: true,
        criador: { _id: 'user-1', username: 'testuser' },
        livros: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await removeBookFromReadlist(readlistId, livroId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(result.livros).not.toContain(livroId);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getOwnReadlists()).rejects.toThrow('Network error');
    });

    it('should handle non-Error throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

      await expect(getOwnReadlists()).rejects.toThrow();
    });
  });

  describe('Authentication checks', () => {
    beforeEach(() => {
      localStorageMock.clear();
    });

    it('should check authentication for all endpoints', async () => {
      // Mock fetch para endpoints públicos
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      });

      // Endpoints que REQUEREM autenticação (devem lançar erro sem token)
      const authenticatedEndpoints = [
        getOwnReadlists,
        () => createReadlist({ nome: 'test', publica: true }),
        () => updateReadlist('id', {}),
        () => deleteReadlist('id'),
        () => addBookToReadlist('id', 'bookId'),
        () => removeBookFromReadlist('id', 'bookId'),
        () => favoriteReadlist('id'),
        () => unfavoriteReadlist('id'),
        () => getFavoriteReadlists()
      ];

      for (const endpoint of authenticatedEndpoints) {
        try {
          await endpoint();
          // Se não lançar erro, o teste deve falhar
          fail('Endpoint deveria ter lançado erro de autenticação');
        } catch (error) {
          // Esperamos que lance erro de token
          expect(error).toBeDefined();
          expect((error as Error).message).toBe('Token não encontrado');
        }
      }

      // Endpoints públicos (NÃO requerem autenticação, mas devem falhar por outros motivos)
      const publicEndpoints = [
        () => getPublicReadlists('user'),
        () => getReadlistById('id')
      ];

      for (const endpoint of publicEndpoints) {
        try {
          await endpoint();
          fail('Endpoint público deveria ter lançado erro 404');
        } catch (error) {
          // Esperamos que lance erro 404, não de autenticação
          expect(error).toBeDefined();
          expect((error as Error).message).not.toBe('Token não encontrado');
        }
      }

      // Fetch deve ter sido chamado apenas 2 vezes (endpoints públicos)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
