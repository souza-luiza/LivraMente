import { Test, TestingModule } from '@nestjs/testing';
import { LivrosService } from './livros.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

describe('LivrosService', () => {
  let service: LivrosService;
  let model: any;

  const mockLivroModel = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LivrosService,
        {
          provide: getModelToken('Livro'),
          useValue: mockLivroModel,
        },
      ],
    }).compile();

    service = module.get<LivrosService>(LivrosService);
    model = module.get(getModelToken('Livro'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os livros', async () => {
      const result = [{ titulo: 'Livro A' }];
      model.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(result),
          }),
        }),
      });

      expect(await service.findAll()).toBe(result);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um livro pelo slug', async () => {
      const slug = 'livro-a';
      const result = { titulo: 'Livro A' };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(result),
      });

      expect(await service.findOne(slug)).toBe(result);
      expect(model.findOne).toHaveBeenCalledWith({ slug });
    });

    it('deve lançar NotFoundException se não encontrar o livro', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneReadlists', () => {
    it('deve retornar readlists de um livro', async () => {
      const slug = 'livro-a';
      const result = [{ nome: 'Readlist A' }];
      model.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ readlists: result }),
          }),
        }),
      });

      expect(await service.findOneReadlists(slug)).toBe(result);
      expect(model.findOne).toHaveBeenCalledWith({ slug });
    });

    it('deve lançar NotFoundException se o livro não existir', async () => {
      model.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOneReadlists('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneComunidades', () => {
    it('deve retornar comunidades de um livro', async () => {
      const slug = 'livro-a';
      const result = [{ nome: 'Comunidade A' }];
      model.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ comunidades: result }),
          }),
        }),
      });

      expect(await service.findOneComunidades(slug)).toBe(result);
      expect(model.findOne).toHaveBeenCalledWith({ slug });
    });

    it('deve lançar NotFoundException se o livro não existir', async () => {
      model.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOneComunidades('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});