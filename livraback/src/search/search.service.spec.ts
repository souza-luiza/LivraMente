import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getModelToken } from '@nestjs/mongoose';

describe('SearchService', () => {
  let service: SearchService;

  // mocks dos modelos do mongoose
  const mockModel = () => ({
    find: jest.fn(),
    select: jest.fn(),
    limit: jest.fn(),
    populate: jest.fn(),
  });

  let userModel: any;
  let readlistModel: any;
  let comunidadeModel: any;
  let livroModel: any;
  let autorModel: any;

  beforeEach(async () => {
    userModel = mockModel();
    readlistModel = mockModel();
    comunidadeModel = mockModel();
    livroModel = mockModel();
    autorModel = mockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: getModelToken('Readlist'), useValue: readlistModel },
        { provide: getModelToken('Comunidade'), useValue: comunidadeModel },
        { provide: getModelToken('Livro'), useValue: livroModel },
        { provide: getModelToken('Autor'), useValue: autorModel },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMelhorResultado', () => {
    it('should return null when no candidates exist', () => {
      const result = service.getMelhorResultado('abc', {
        users: [],
        comunidades: [],
        readlists: [],
        livros: [],
      });

      expect(result).toBeNull();
    });

    it('should return the best matching user', () => {
      const result = service.getMelhorResultado('john', {
        users: [{ username: 'john' }] as any,
        comunidades: [],
        readlists: [],
        livros: [],
      });
    
      expect(result?.tipo).toBe('user');
      expect((result?.item as any).username).toBe('john');
      expect(result?.score).toBe(3); // match exato
    });

    it('should prioritize exact match over partial match', () => {
      const result = service.getMelhorResultado('har', {
        users: [{ username: 'harry' }] as any,
        comunidades: [{ nome: 'har' }] as any,
        readlists: [],
        livros: [],
      });

      expect(result?.tipo).toBe('comunidade');
      expect(result?.score).toBe(3);
    });
  });

  describe('search', () => {
    it('should return null when query is empty', async () => {
      const res = await service.search('');
      expect(res).toBeNull();
    });

    it('should call all models with regex', async () => {
      const regex = /test/i;

      // mocks retornando arrays
      userModel.find.mockReturnValue({
        select: () => ({ limit: () => [] }),
      });

      comunidadeModel.find.mockReturnValue({
        select: () => ({ limit: () => [] }),
      });

      readlistModel.find.mockReturnValue({
        select: () => ({ populate: () => ({ limit: () => [] }) }),
      });

      livroModel.find.mockReturnValue({
        select: () => ({ populate: () => ({ limit: () => [] }) }),
      });

      autorModel.find.mockReturnValue({
        select: () => ({ limit: () => [] }),
      });

      const res = await service.search('test');

      expect(res).toHaveProperty('melhorResultado');
      expect(res).toHaveProperty('users');
      expect(userModel.find).toHaveBeenCalledTimes(1);
      expect(comunidadeModel.find).toHaveBeenCalledTimes(1);
      expect(readlistModel.find).toHaveBeenCalledTimes(2);
      expect(livroModel.find).toHaveBeenCalledTimes(1);
      expect(autorModel.find).toHaveBeenCalledTimes(1);
    });

    it('should merge livros encontrados por autor', async () => {
      userModel.find.mockReturnValue({ select: () => ({ limit: () => [] }) });
      comunidadeModel.find.mockReturnValue({ select: () => ({ limit: () => [] }) });
      readlistModel.find.mockReturnValue({ select: () => ({ populate: () => ({ limit: () => [] }) }) });

      livroModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue([{ titulo: 'Livro 1' }]),
          }),
        }),
      });

      autorModel.find.mockReturnValue({
        select: () => ({ limit: () => [{ _id: 'autor123' }] }),
      });

      livroModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue([{ titulo: 'Livro Autor', autores:['autor123'] }]),
        }),
      });

      const res = await service.search('test');

      expect(res?.livros.length).toBe(1);
      expect(res?.livros[0].titulo).toBe('Livro Autor');
    });
  });
});