import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadesService } from './comunidades.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
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

  describe('create', () => {
    it('deve criar uma comunidade com sucesso', async () => {
      const criadorId = 'user123';
      const dto = { nome: 'livros' };

      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) } as any);

      const mockSave = jest.fn().mockResolvedValue({
        _id: '1',
        nome: 'livros',
        moderadores: [criadorId],
        membros: [criadorId],
      });

      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      (service as any).comunidadeModel = Object.assign(mockConstructor, comunidadeModel);

      const result = await service.create(criadorId, dto);

      expect(result).toEqual({
        _id: '1',
        nome: 'livros',
        moderadores: [criadorId],
        membros: [criadorId],
      });

      expect(mockConstructor).toHaveBeenCalledWith({
        ...dto,
        moderadores: [criadorId],
        membros: [criadorId],
      });
    });

    it('deve lançar ConflictException se o nome já existir', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ nome: 'livros' }) } as any);

      await expect(service.create('u1', { nome: 'livros' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const userId = 'user1';
    const comunidadeNome = 'fantasia';
    const updateDto = { nome: 'nova-fantasia' };

    it('deve atualizar uma comunidade com sucesso', async () => {
      const comunidade = {
        nome: comunidadeNome,
        moderadores: [userId],
      };

      comunidadeModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any) // busca comunidade existente
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) } as any); // verifica se novo nome já existe

      const updatedDoc = { nome: 'nova-fantasia', moderadores: [userId] };
      comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      } as any);

      const result = await service.update(userId, comunidadeNome, updateDto);

      expect(result).toEqual(updatedDoc);
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: comunidadeNome },
        { $set: updateDto },
        { new: true, runValidators: true },
      );
    });

    it('deve lançar NotFoundException se comunidade não existir', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.update(userId, comunidadeNome, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException se usuário não for moderador', async () => {
      const comunidade = { nome: comunidadeNome, moderadores: ['outroUser'] };
      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any);

      await expect(service.update(userId, comunidadeNome, updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar ConflictException se novo nome já existir', async () => {
      const comunidade = { nome: comunidadeNome, moderadores: [userId] };
      comunidadeModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ nome: 'nova-fantasia' }) } as any);

      await expect(service.update(userId, comunidadeNome, updateDto)).rejects.toThrow(ConflictException);
    });
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
      const mockExecFindOne = jest.fn().mockResolvedValue({
        _id: '123',
        moderadores: ['u1', 'u2'],
        membros: ['u1', 'u2', 'u3'],
      });
      comunidadeModel.findOne.mockReturnValue({ exec: mockExecFindOne } as any);

      const mockExecFindOneAndUpdate = jest.fn().mockResolvedValue({
        _id: '123',
        moderadores: ['u1', 'u2'],
        membros: ['u2', 'u3'],
      });
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExecFindOneAndUpdate } as any);

      const result = await service.removeMembro('u1', 'fantasia');
      expect(result).toEqual({ message: 'Usuário removido da comunidade com sucesso' });

      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { membros: 'u1' } },
        { new: true }
      );

      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { moderadores: 'u1' } },
        { new: true }
      );
    });

    it('deve lançar NotFoundException se comunidade não for encontrada ao remover membro', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.removeMembro('u1', 'naoexiste')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se o ID for inválido ao remover membro', async () => {
      const mockError = { name: 'CastError', message: 'Invalid ObjectId' };
      
      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.removeMembro('badId', 'fantasia')).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se o único moderador for removido', async () => {
      const comunidade = {
        nome: 'fantasia',
        moderadores: ['u1'],
        membros: ['u1', 'u2'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidade),
      } as any);

      await expect(service.removeMembro('u1', 'fantasia')).rejects.toThrow(BadRequestException);
      expect(comunidadeModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});