import {
  getUserReadlists,
  getPublicReadlists,
  getReadlistById,
  createReadlist,
  updateReadlist,
  deleteReadlist,
  addBookToReadlist,
  removeBookFromReadlist
} from '@/services/readlist';
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

  describe('getUserReadlists', () => {
    it('should fetch user readlists successfully', async () => {
      const mockReadlists: Readlist[] = [
        {
          _id: '1',
          nome: 'Favoritos',
          favorito: true,
          publica: true,
          criador: 'user-1',
          livros: []
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadlists
      });

      const result = await getUserReadlists();

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

      await expect(getUserReadlists()).rejects.toThrow('Usuário não autenticado');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error on 401 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(getUserReadlists()).rejects.toThrow('Sessão expirada. Faça login novamente.');
    });

    it('should throw error on 500 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getUserReadlists()).rejects.toThrow('Erro interno do servidor');
    });

    it('should throw generic error on other failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(getUserReadlists()).rejects.toThrow('Erro ao buscar readlists');
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
          criador: 'user-1',
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
        criador: 'user-1',
        livros: [
          {
            id: '1',
            title: 'Book 1',
            year: '2024',
            pages: '300 pags',
            rating: 5,
            cover: '/cover.jpg'
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
        criador: 'user-1',
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

      await expect(createReadlist({ nome: '' })).rejects.toThrow('Dados inválidos');
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
        criador: 'user-1',
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
        criador: 'user-1',
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
        criador: 'user-1',
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

      await expect(getUserReadlists()).rejects.toThrow('Network error');
    });

    it('should handle non-Error throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

      await expect(getUserReadlists()).rejects.toThrow('Erro de rede ao buscar readlists');
    });
  });

  describe('Authentication checks', () => {
    beforeEach(() => {
      localStorageMock.clear();
    });

    it('should check authentication for all endpoints', async () => {
      const endpoints = [
        () => getUserReadlists(),
        () => getPublicReadlists('user'),
        () => getReadlistById('id'),
        () => createReadlist({ nome: 'test' }),
        () => updateReadlist('id', {}),
        () => deleteReadlist('id'),
        () => addBookToReadlist('id', 'bookId'),
        () => removeBookFromReadlist('id', 'bookId')
      ];

      for (const endpoint of endpoints) {
        await expect(endpoint()).rejects.toThrow('Usuário não autenticado');
      }

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
