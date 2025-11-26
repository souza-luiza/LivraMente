import { Test, TestingModule } from '@nestjs/testing';
import { LivrosController } from './livros.controller';
import { LivrosService } from './livros.service';

describe('LivrosController', () => {
  let controller: LivrosController;
  let service: LivrosService;

  const mockLivrosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneReadlists: jest.fn(),
    findOneComunidades: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivrosController],
      providers: [
        {
          provide: LivrosService,
          useValue: mockLivrosService,
        },
      ],
    }).compile();

    controller = module.get<LivrosController>(LivrosController);
    service = module.get<LivrosService>(LivrosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os livros', async () => {
      const result = [{ titulo: 'Livro A', isbn: 'teste', slug: 'teste', ano_publicacao: 2020, numero_paginas: 200 } as any];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um livro pelo slug', async () => {
      const slug = 'livro-a';
      const result = { titulo: 'Livro A' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(slug)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(slug);
    });
  });

  describe('findOneReadlists', () => {
    it('deve retornar readlists relacionadas ao livro', async () => {
      const slug = 'livro-a';
      const result = [{ nome: 'Readlist A' }] as any;
      jest.spyOn(service, 'findOneReadlists').mockResolvedValue(result);

      expect(await controller.findOneReadlists(slug)).toBe(result);
      expect(service.findOneReadlists).toHaveBeenCalledWith(slug);
    });
  });

  describe('findOneComunidades', () => {
    it('deve retornar comunidades relacionadas ao livro', async () => {
      const slug = 'livro-a';
      const result = [{ nome: 'Comunidade A' }] as any;
      jest.spyOn(service, 'findOneComunidades').mockResolvedValue(result);

      expect(await controller.findOneComunidades(slug)).toBe(result);
      expect(service.findOneComunidades).toHaveBeenCalledWith(slug);
    });
  });
});