import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getModelToken } from '@nestjs/mongoose';

// mock de ObjectId com equals()
const mockId = (id: string) => ({
  toString: () => id,
  equals: (other: any) => other?.toString() === id,
});

const createQueryMock = (data: any) => ({
  select: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnValue(data),
  populate: jest.fn().mockReturnThis(),
});

describe('SearchService', () => {
  let service: SearchService;

  let userModel: any;
  let readlistModel: any;
  let comunidadeModel: any;
  let livroModel: any;
  let autorModel: any;

  beforeEach(async () => {
    userModel = { find: jest.fn() };
    readlistModel = { find: jest.fn() };
    comunidadeModel = { find: jest.fn() };
    livroModel = { find: jest.fn() };
    autorModel = { find: jest.fn() };

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

  // -------------------------------------------------------------------
  // getMelhorResultado
  // -------------------------------------------------------------------

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
        users: [{ _id: mockId('1'), username: 'john' }] as any,
        comunidades: [],
        readlists: [],
        livros: [],
      });

      expect(result?.tipo).toBe('user');
      expect((result?.item as any).username).toBe('john');
      expect(result?.score).toBe(3);
    });

    it('should prioritize exact match over partial match', () => {
      const result = service.getMelhorResultado('har', {
        users: [{ _id: mockId('1'), username: 'harry' }] as any,
        comunidades: [{ _id: mockId('2'), nome: 'har' }] as any,
        readlists: [],
        livros: [],
      });

      expect(result?.tipo).toBe('comunidade');
      expect(result?.score).toBe(3); // match exato
    });
  });

  // -------------------------------------------------------------------
  // search()
  // -------------------------------------------------------------------

  describe('search', () => {
    it('should return null when query is empty', async () => {
      const res = await service.search('');
      expect(res).toBeNull();
    });

    it('should merge readlists of users', async () => {
      userModel.find.mockReturnValue(
        createQueryMock([
          {
            _id: mockId('u1'),
            username: 'john',
            readlists: [mockId('rl1')],
          },
        ]),
      );

      comunidadeModel.find.mockReturnValue(createQueryMock([]));
      livroModel.find.mockReturnValue(createQueryMock([]));

      readlistModel.find.mockReturnValueOnce(
        createQueryMock([]), // readlists por nome
      );

      readlistModel.find.mockReturnValueOnce(
        createQueryMock([
          {
            _id: mockId('rl1'),
            nome: 'Lista do John',
          },
        ]),
      );

      autorModel.find.mockReturnValue(createQueryMock([]));

      const res = await service.search('john');

      expect(res?.readlists.length).toBe(1);
      expect(res?.readlists[0].nome).toBe('Lista do John');
    });

    it('should merge livros encontrados por autor', async () => {
      userModel.find.mockReturnValue(createQueryMock([]));
      comunidadeModel.find.mockReturnValue(createQueryMock([]));
      readlistModel.find.mockReturnValue(createQueryMock([]));

      // livros por título
      livroModel.find.mockReturnValueOnce(
        createQueryMock([
          { _id: mockId('l1'), titulo: 'Livro 1', autores: [] },
        ]),
      );

      // autores encontrados
      autorModel.find.mockReturnValue(
        createQueryMock([{ _id: mockId('a1') }]),
      );

      // livros por autor
      livroModel.find.mockReturnValueOnce(
        createQueryMock([
          { _id: mockId('l2'), titulo: 'Livro do Autor', autores: [mockId('a1')] },
        ]),
      );

      const res = await service.search('harry');

      expect(res?.livros.length).toBe(1);
      expect(res?.livros[0].titulo).toBe('Livro do Autor');
    });

    it('should avoid duplicating melhorResultado', async () => {
      userModel.find.mockReturnValue(
        createQueryMock([
          { _id: mockId('1'), username: 'john', readlists: [] },
        ]),
      );

      comunidadeModel.find.mockReturnValue(createQueryMock([]));
      readlistModel.find.mockReturnValue(createQueryMock([]));
      livroModel.find.mockReturnValue(createQueryMock([]));
      autorModel.find.mockReturnValue(createQueryMock([]));

      const res = await service.search('john');

      expect(res?.users.length).toBe(0); // removido por ser o melhorResultado
      expect(res?.melhorResultado?.tipo).toBe('user');
    });
  });
});