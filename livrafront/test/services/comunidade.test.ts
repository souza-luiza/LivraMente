import { createCommunity, updateCommunity } from '@/services/comunidade';

describe('comunidade service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createCommunity resolves with json on success', async () => {
    const mockResponse = { ok: true, json: async () => ({ id: 'c1', nome: 'Teste' }) } as unknown as Response;
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const payload = { nome: 'Teste' } as Record<string, unknown>;
    const result = await createCommunity(payload);

    expect(fetchMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1', nome: 'Teste' });
  });

  it('createCommunity rejects with message when response not ok', async () => {
    const mockResponse = { ok: false, text: async () => 'Bad request' } as unknown as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    await expect(createCommunity({ nome: 'X' } as any)).rejects.toThrow('Bad request');
  });

  it('updateCommunity resolves with json on success', async () => {
    const mockResponse = { ok: true, json: async () => ({ id: 'c1', nome: 'Novo' }) } as unknown as Response;
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const payload = { nome: 'Novo' } as Record<string, unknown>;
    const result = await updateCommunity('Comunidade', payload);

    expect(fetchMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1', nome: 'Novo' });
  });

  it('updateCommunity rejects with message when response not ok', async () => {
    const mockResponse = { ok: false, text: async () => 'Update failed' } as unknown as Response;
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    await expect(updateCommunity('C', { nome: 'x' })).rejects.toThrow('Update failed');
  });
});
