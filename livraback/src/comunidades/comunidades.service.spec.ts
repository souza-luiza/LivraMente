import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadesService } from './comunidades.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comunidade } from './entities/comunidade.entity';

describe('ComunidadesService', () => {
  let service: ComunidadesService;
  let comunidadeModel: jest.Mocked<Model<Comunidade>>;

  beforeEach(async () => {
    const mockModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunidadesService,
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ComunidadesService>(ComunidadesService);
    comunidadeModel = module.get(getModelToken(Comunidade.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPosts', () => {
    it('deve retornar os posts da comunidade', async () => {
      const mockExec = jest.fn().mockResolvedValue({ posts: ['post1', 'post2'] });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);
  
      const result = await service.findAllPosts('livros');
      expect(result).toEqual(['post1', 'post2']);
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'livros' });
    });
  
    it('deve lançar NotFoundException se comunidade não existir em findAllPosts', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);
  
      await expect(service.findAllPosts('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllComunidadeMembros', () => {
    it('deve retornar membros da comunidade', async () => {
      const mockExec = jest.fn().mockResolvedValue({ membros: ['user1', 'user2'] });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);
  
      const result = await service.findAllComunidadeMembros('fantasia');
      expect(result).toEqual(['user1', 'user2']);
    });
  
    it('deve lançar NotFoundException se comunidade não existir em findAllComunidadeMembros', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);
  
      await expect(service.findAllComunidadeMembros('nada')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMembro', () => {
    it('deve adicionar membro e retornar mensagem de sucesso', async () => {
      const mockExec = jest.fn().mockResolvedValue({ _id: '123', membros: ['u1', 'u2'] });
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      const result = await service.addMembro('u3', 'fantasia');
      expect(result).toEqual({ message: 'Usuário adicionado à comunidade com sucesso' });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $addToSet: { membros: 'u3' } },
        { new: true, runValidators: true },
      );
    });
  
    it('deve lançar NotFoundException se comunidade não for encontrada ao adicionar membro', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      await expect(service.addMembro('u1', 'naoexiste')).rejects.toThrow(NotFoundException);
    });
  
    it('deve lançar BadRequestException se o ID for inválido ao adicionar membro', async () => {
      const mockError = { name: 'CastError' };
      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);
  
      await expect(service.addMembro('invalid', 'fantasia')).rejects.toThrow(BadRequestException);
    });
  });
  

  describe('removeMembro', () => {
    it('deve remover membro e retornar mensagem de sucesso', async () => {
      const mockExec = jest.fn().mockResolvedValue({ _id: '123' });
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      const result = await service.removeMembro('u1', 'fantasia');
      expect(result).toEqual({ message: 'Usuário removido da comunidade com sucesso' });
    });
  
    it('deve lançar NotFoundException se comunidade não for encontrada ao remover membro', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      await expect(service.removeMembro('u1', 'naoexiste')).rejects.toThrow(NotFoundException);
    });
  
    it('deve lançar BadRequestException se o ID for inválido ao remover membro', async () => {
      const mockError = { name: 'CastError' };
      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);
  
      await expect(service.removeMembro('badId', 'fantasia')).rejects.toThrow(BadRequestException);
    });
  });
});