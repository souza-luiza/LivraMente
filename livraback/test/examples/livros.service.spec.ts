import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Livro } from '../../src/schemas/livro.schema';
import { Injectable } from '@nestjs/common';

// Service exemplo 
@Injectable()
class LivrosService {
  constructor(private readonly livroModel: Model<Livro>) {}

  // Busca todos os livros
  async findAll(): Promise<Livro[]> {
    return this.livroModel.find().exec();
  }

  // Busca um livro por ID
  async findOne(id: string): Promise<Livro | null> {
    return this.livroModel.findById(id).exec();
  }

  // Calcula a avaliação média de um livro
  async calcularAvaliacaoMedia(livroId: string): Promise<number> {
    const livro = await this.livroModel.findById(livroId).exec();
    return livro?.avaliacoes_media || 0;
  }
}

// Agrupa os testes do LivrosService
describe('LivrosService', () => {
  let service: LivrosService;  //  Instância do service que será testado
  let model: Model<Livro>;     //  Modelo mockado do MongoDB

  // Mock do modelo
  const mockLivroModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  // Configura o módulo de teste antes de cada teste
  beforeEach(async () => {
    jest.clearAllMocks(); // Limpa antes também
    
    const module: TestingModule = await Test.createTestingModule({   // Cria um ambiente isolado de teste, igual ao app.module.ts
      providers: [
        {
          provide: LivrosService,
          useFactory: (livroModel: Model<Livro>) => new LivrosService(livroModel),
          inject: [getModelToken(Livro.name)],
        },
        {
          provide: getModelToken(Livro.name),  // ← "Quando pedir o modelo Livro"
          useValue: mockLivroModel,            // ← "use o MOCK ao invés do banco real!"
        },
      ],
    }).compile();

    service = module.get<LivrosService>(LivrosService);
    model = module.get<Model<Livro>>(getModelToken(Livro.name));
  });

  // Limpeza dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testes em si

  describe('findAll', () => {
    it('deve retornar array de livros', async () => {
      const mockLivros = [
        { titulo: 'Harry Potter', isbn: '123' },    // Dados falsos mockados
        { titulo: '1984', isbn: '456' },
      ];

      mockLivroModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLivros),
      });

      const result = await service.findAll();     // Chama mockLivroModel.find().exec()

      // Verifica se o resultado bate com o mock
      expect(result).toEqual(mockLivros);
      expect(model.find).toHaveBeenCalled();
    });

    it('deve retornar array vazio se não houver livros', async () => {
      mockLivroModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findOne', () => {
    it('deve retornar um livro por ID', async () => {
      const mockLivro = {
        _id: '123',
        titulo: 'Harry Potter',
        isbn: '9788532530787',
      };

      mockLivroModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLivro),
      });

      const result = await service.findOne('123');

      expect(result).toEqual(mockLivro);
      expect(model.findById).toHaveBeenCalledWith('123');
    });

    it('deve retornar null se livro não existir', async () => {
      mockLivroModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('calcularAvaliacaoMedia', () => {
    it('deve retornar a média de avaliações', async () => {
      const mockLivro = {
        _id: '123',
        titulo: 'Harry Potter',
        avaliacoes_media: 4.5,
      };

      mockLivroModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLivro),
      });

      const result = await service.calcularAvaliacaoMedia('123');

      expect(result).toBe(4.5);
    });

    it('deve retornar 0 se livro não tiver avaliações', async () => {
      const mockLivro = {
        _id: '123',
        titulo: 'Livro Novo',
        avaliacoes_media: 0,
      };

      mockLivroModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLivro),
      });

      const result = await service.calcularAvaliacaoMedia('123');

      expect(result).toBe(0);
    });

    it('deve retornar 0 se livro não existir', async () => {
      mockLivroModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.calcularAvaliacaoMedia('999');

      expect(result).toBe(0);
    });
  });
});
