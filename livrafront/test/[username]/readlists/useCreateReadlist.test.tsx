import { renderHook, act } from '@testing-library/react'; 
import { useCreateReadlist } from '@/hooks/useCreateReadlist';

// Mocks das funções
jest.mock('@/services/readlists', () => ({
  createReadlist: jest.fn(),
  updatePhoto: jest.fn(),
}));

// Importando as funções mockadas para usá-las nos testes
const { createReadlist: mockCreateReadlistService, updatePhoto: mockUpdatePhoto } = require('@/services/readlists');

describe('useCreateReadlist', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should set error if title is missing', async () => {
    const { result } = renderHook(() => useCreateReadlist());

    // Chama a função com dados inválidos (sem título)
    await act(async () => {
      await result.current.handleCreateReadlist(
        { nome: '', descricao: 'Description', publica: true },
        null
      );
    });

    // Verifica se o erro foi setado corretamente
    expect(result.current.apiError).toBe('');
    expect(mockCreateReadlistService).not.toHaveBeenCalled();
  });

  it('should create readlist successfully', async () => {
    // Mockando a resposta do serviço
    mockCreateReadlistService.mockResolvedValue({
      slug: 'readlist-slug',
      nome: 'Test Readlist',
    });

    const { result } = renderHook(() => useCreateReadlist());

    // Chama a função com dados válidos
    await act(async () => {
      await result.current.handleCreateReadlist(
        { nome: 'Test Readlist', descricao: 'Description', publica: true },
        null
      );
    });

    // Verifica se a função foi chamada e o estado de erro foi limpo
    expect(result.current.apiError).toBe('');
    expect(mockCreateReadlistService).toHaveBeenCalledWith('Test Readlist', 'Description', true);
    expect(mockUpdatePhoto).not.toHaveBeenCalled();
  });

  it('should update photo if croppedImageBlob is provided', async () => {
    // Mockando a resposta do serviço
    mockCreateReadlistService.mockResolvedValue({
      slug: 'readlist-slug',
      nome: 'Test Readlist',
    });

    const croppedImageBlob = new Blob(['test'], { type: 'image/jpeg' });
    const { result } = renderHook(() => useCreateReadlist());

    // Chama a função com imagem (croppedImageBlob)
    await act(async () => {
      await result.current.handleCreateReadlist(
        { nome: 'Test Readlist', descricao: 'Description', publica: true },
        croppedImageBlob
      );
    });

    // Verifica se o método updatePhoto foi chamado
    expect(mockUpdatePhoto).toHaveBeenCalledWith(
      expect.any(FormData), 
      'readlist-slug'
    );
  });

  it('should handle errors during creation', async () => {
    // Mockando erro na criação
    mockCreateReadlistService.mockRejectedValue(new Error('Erro ao criar readlist'));

    const { result } = renderHook(() => useCreateReadlist());

    // Chama a função com dados válidos
    await act(async () => {
      await result.current.handleCreateReadlist(
        { nome: 'Test Readlist', descricao: 'Description', publica: true },
        null
      );
    });

    // Verifica se o erro foi setado
    expect(result.current.apiError).toBe('Erro ao criar readlist');
    expect(mockCreateReadlistService).toHaveBeenCalledWith(
      'Test Readlist',
      'Description',
      true
    );
  });
});