import { resenhasService } from '../../src/services/resenhas';

const globalAny: any = global;

describe('resenhasService', () => {
  beforeEach(() => {
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getResenhasByBook - sucesso', async () => {
    const mockResenhas = [{ _id: '1', conteudo: 'abc', avaliacao: 5 }];
    globalAny.fetch.mockResolvedValue({ ok: true, json: async () => mockResenhas });
    const result = await resenhasService.getResenhasByBook('book1');
    expect(result).toEqual(mockResenhas);
    expect(globalAny.fetch).toHaveBeenCalledWith(expect.stringContaining('/resenhas/book1'), expect.any(Object));
  });


  it('getResenha - sucesso', async () => {
    const mockResenha = { _id: '1', conteudo: 'abc', avaliacao: 5 };
    globalAny.fetch.mockResolvedValue({ ok: true, json: async () => mockResenha });
    const result = await resenhasService.getResenha('id');
    expect(result).toEqual(mockResenha);
  });

  it('getResenhasByBook - erro', async () => {
    globalAny.fetch.mockResolvedValue({ ok: false });
    await expect(resenhasService.getResenhasByBook('book1')).rejects.toThrow('Erro ao buscar resenhas do livro.');
  });

  it('createResenha - erro', async () => {
    globalAny.fetch.mockResolvedValue({ ok: false });
    await expect(resenhasService.createResenha('book1', { conteudo: 'abc', avaliacao: 5, spoiler: false })).rejects.toThrow('Erro ao criar resenha.');
  });

  it('createResenha - sucesso', async () => {
    const mockResenha = { _id: '1', conteudo: 'abc', avaliacao: 5 };
    globalAny.fetch.mockResolvedValue({ ok: true, json: async () => mockResenha });
    const result = await resenhasService.createResenha('book1', { conteudo: 'abc', avaliacao: 5, spoiler: false });
    expect(result).toEqual(mockResenha);
  });


  it('updateResenha - sucesso', async () => {
    const mockResenha = { _id: '1', conteudo: 'editado', avaliacao: 4 };
    globalAny.fetch.mockResolvedValue({ ok: true, json: async () => mockResenha });
    const result = await resenhasService.updateResenha('id', { conteudo: 'editado' });
    expect(result).toEqual(mockResenha);
  });

  it('updateResenha - erro', async () => {
    globalAny.fetch.mockResolvedValue({ ok: false });
    await expect(resenhasService.updateResenha('id', { conteudo: 'x' })).rejects.toThrow('Erro ao editar resenha.');
  });

  it('removeResenha - sucesso', async () => {
    globalAny.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await expect(resenhasService.removeResenha('id')).resolves.toBeDefined();
  });

  it('removeResenha - erro', async () => {
    globalAny.fetch.mockResolvedValue({ ok: false });
    await expect(resenhasService.removeResenha('id')).rejects.toThrow('Erro ao excluir resenha.');
  });
});
