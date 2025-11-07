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
      find: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
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

  describe('findAll', () => {
    it('deve retornar todas as comunidades com sucesso', async () => {
      const comunidadesMock = [
        { _id: '1', nome: 'Livros', moderadores: ['user1'], membros: ['user1'] },
        { _id: '2', nome: 'Música', moderadores: ['user2'], membros: ['user2'] }
      ];

      comunidadeModel.find.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidadesMock) } as any);

      const result = await service.findAll();
      expect(result).toEqual(comunidadesMock);
      expect(comunidadeModel.find).toHaveBeenCalled();
    });
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

  describe('findOne', () => {
    it('deve retornar uma comunidade específica pelo nome com sucesso', async () => {
      const comunidadeMock = {
        _id: '1',
        nome: 'fantasia',
        descricao: 'Comunidade sobre livros de fantasia',
        moderadores: ['user1'],
        membros: ['user1', 'user2']
      };
      
      comunidadeModel.findOne.mockResolvedValueOnce(comunidadeMock as any);

      const result = await service.findOne('fantasia');

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({
        $or: [
          { slug: 'fantasia' },
          { nome: 'fantasia' }
        ]
      });
      expect(result).toEqual(comunidadeMock);
    });

    it('deve lançar NotFoundException quando comunidade não for encontrada', async () => {
      // service.findOne awaits the result directly; simulate a null result
      comunidadeModel.findOne.mockResolvedValueOnce(null as any);

      await expect(service.findOne('comunidade-inexistente'))
        .rejects.toThrow(NotFoundException);
      
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({
        $or: [
          { slug: 'comunidade-inexistente' },
          { nome: 'comunidade-inexistente' }
        ]
      });
    });
  });

  describe('findAllComunidadeModeradores', () => {
    it('deve retornar moderadores da comunidade com sucesso', async () => {
      const mockModeradores = [
        { _id: '1', username: 'mod1', email: 'mod1@email.com' },
        { _id: '2', username: 'mod2', email: 'mod2@email.com' }
      ];

      const mockExec = jest.fn().mockResolvedValue({ moderadores: mockModeradores });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

      const result = await service.findAllComunidadeModeradores('fantasia');

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'fantasia' });
      expect(mockPopulate).toHaveBeenCalledWith('moderadores');
      expect(result).toEqual(mockModeradores);
    });

    it('deve lançar NotFoundException quando comunidade não for encontrada', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

      await expect(service.findAllComunidadeModeradores('comunidade-inexistente'))
        .rejects.toThrow(NotFoundException);
    });

    it('deve retornar array vazio quando não houver moderadores', async () => {
      const mockExec = jest.fn().mockResolvedValue({ moderadores: [] });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

      const result = await service.findAllComunidadeModeradores('comunidade-nova');

      expect(result).toEqual([]);
    });
  });

  describe('verifyMemberOrMod', () => {
    it('deve verificar que usuário é membro mas não moderador', async () => {
      const comunidadeMock = {
        membros: ['user1', 'user2'],
        moderadores: ['user1']
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

      const result = await service.verifyMemberOrMod('user2', 'fantasia');

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'fantasia' });
      expect(result).toEqual({
        isMember: true,
        isModerador: false
      });
    });

    it('deve verificar que usuário é moderador', async () => {
      const comunidadeMock = {
        membros: ['user1', 'user2'],
        moderadores: ['user1', 'user2']
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

      const result = await service.verifyMemberOrMod('user1', 'fantasia');

      expect(result).toEqual({
        isMember: true,
        isModerador: true
      });
    });

    it('deve verificar que usuário não é membro nem moderador', async () => {
      const comunidadeMock = {
        membros: ['user1', 'user2'],
        moderadores: ['user1']
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

      const result = await service.verifyMemberOrMod('user3', 'fantasia');

      expect(result).toEqual({
        isMember: false,
        isModerador: false
      });
    });

    it('deve lançar NotFoundException quando comunidade não for encontrada', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      } as any);

      await expect(service.verifyMemberOrMod('user1', 'comunidade-inexistente'))
        .rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException quando userId não for fornecido', async () => {
      await expect(service.verifyMemberOrMod('', 'fantasia'))
        .rejects.toThrow(UnauthorizedException);

      await expect(service.verifyMemberOrMod('', 'fantasia'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('deve lidar com ObjectIds convertendo para string corretamente', async () => {
      const comunidadeMock = {
        membros: [{ toString: () => 'user1' }, { toString: () => 'user2' }],
        moderadores: [{ toString: () => 'user1' }]
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

      const result = await service.verifyMemberOrMod('user2', 'fantasia');

      expect(result).toEqual({
        isMember: true,
        isModerador: false
      });
    });
  });
});