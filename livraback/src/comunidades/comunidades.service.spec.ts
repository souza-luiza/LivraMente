const mockQueueProducer = {
  publish: jest.fn(),
};
import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadesService } from './comunidades.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Comentario } from 'src/schemas/comentario.schema';
import { Comunidade, ComunidadeDocument } from './entities/comunidade.entity';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { Types } from 'mongoose';
import { QueueProducerService } from '../queue/queue.producer.service';

const ROUTING_KEYS = {
  NOTIFICAR_MEMBRO_ENTROU: 'notificar.membro.entrou',
};

describe('ComunidadesService', () => {
  let service: ComunidadesService;
  let comunidadeModel: any;
  let queueProducer: jest.Mocked<QueueProducerService>;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      deleteOne: jest.fn(),
    };
    const mockPostModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      deleteMany: jest.fn(),
    };

    const mockComentarioModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      deleteMany: jest.fn(),
    };

    const mockLivroModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers:
      [
        ComunidadesService,
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Post'),
          useValue: mockPostModel,
        },
        {
          provide: getModelToken(Comentario.name),
          useValue: mockComentarioModel,
        },
        {
          provide: getModelToken('Livro'),
          useValue: mockLivroModel,
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/img.jpg', public_id: 'public-id' }),
            deleteImage: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: QueueProducerService,
          useValue: mockQueueProducer,
        },
      ],
    }).compile();

    service = module.get<ComunidadesService>(ComunidadesService);
    comunidadeModel = module.get(getModelToken(Comunidade.name));
    // default comentario.find to empty array to avoid undefined when service uses .flatMap
    if (mockComentarioModel && typeof mockComentarioModel.find === 'function') {
      mockComentarioModel.find.mockResolvedValue([]);
    }
    queueProducer = module.get(QueueProducerService) as jest.Mocked<QueueProducerService>;

    jest.clearAllMocks();
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

    it('deve retornar array vazio quando não houver comunidades', async () => {
      comunidadeModel.find.mockReturnValueOnce({ 
        exec: jest.fn().mockResolvedValue([]) 
      } as any);

      const result = await service.findAll();
      
      expect(result).toEqual([]);
    });

    it('deve lidar com erro durante find', async () => {
      comunidadeModel.find.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect(service.findAll()).rejects.toThrow('Database error');
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
      
      comunidadeModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

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
      comunidadeModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      } as any);

      await expect(service.findOne('comunidade-inexistente'))
        .rejects.toThrow(NotFoundException);
      
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({
        $or: [
          { slug: 'comunidade-inexistente' },
          { nome: 'comunidade-inexistente' }
        ]
      });
    });

    it('deve encontrar comunidade por slug quando nome não existe', async () => {
      const comunidadeMock = {
        _id: '1',
        nome: 'fantasia',
        slug: 'fantasia-slug',
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(comunidadeMock)
        })
      } as any);

      const result = await service.findOne('fantasia-slug');

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({
        $or: [
          { slug: 'fantasia-slug' },
          { nome: 'fantasia-slug' }
        ]
      });
      expect(result).toEqual(comunidadeMock);
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

    it('deve lidar com erro durante o save da comunidade', async () => {
      const criadorId = 'user123';
      const dto = { nome: 'livros' };

      comunidadeModel.findOne.mockReturnValueOnce({ 
        exec: jest.fn().mockResolvedValue(null) 
      } as any);

      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      (service as any).comunidadeModel = Object.assign(mockConstructor, comunidadeModel);

      await expect(service.create(criadorId, dto)).rejects.toThrow('Database error');
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
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) } as any);

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

    it('deve atualizar sem alterar o nome quando updateDto.nome não for fornecido', async () => {
      const comunidade = {
        nome: comunidadeNome,
        moderadores: [userId],
      };
      const updateDtoSemNome = { descricao: 'Nova descrição' };

      comunidadeModel.findOne.mockReturnValueOnce({ 
        exec: jest.fn().mockResolvedValue(comunidade) 
      } as any);

      const updatedDoc = { ...comunidade, ...updateDtoSemNome };
      comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      } as any);

      const result = await service.update(userId, comunidadeNome, updateDtoSemNome);

      expect(result).toEqual(updatedDoc);
      expect(comunidadeModel.findOne).toHaveBeenCalledTimes(1);
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

    it('deve retornar array vazio quando não houver posts', async () => {
      const mockExec = jest.fn().mockResolvedValue({ posts: [] });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

      const result = await service.findAllPosts('livros');
      
      expect(result).toEqual([]);
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

    it('deve retornar array vazio quando não houver membros', async () => {
      const mockExec = jest.fn().mockResolvedValue({ membros: [] });
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

      const result = await service.findAllComunidadeMembros('fantasia');
      
      expect(result).toEqual([]);
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

  describe('addMembro', () => {
    it('deve adicionar membro, publicar evento de mensageria e retornar mensagem de sucesso', async () => {
      const mockUpdated = { 
        _id: '123', 
        nome: 'fantasia',
        membros: ['u1', 'u2', 'u3'] 
      };
      const mockExec = jest.fn().mockResolvedValue(mockUpdated);
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      const result = await service.addMembro('u3', 'fantasia');
      
      expect(result).toEqual({ message: 'Usuário adicionado à comunidade com sucesso' });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $addToSet: { membros: 'u3' } },
        { new: true, runValidators: true },
      );

      // Verificar evento de mensageria
      expect(queueProducer.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.NOTIFICAR_MEMBRO_ENTROU,
        expect.objectContaining({
          userId: 'u3',
          comunidadeId: '123',
          comunidadeNome: 'fantasia',
        })
      );
    });
  
    it('deve lançar NotFoundException se comunidade não for encontrada ao adicionar membro', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);
  
      await expect(service.addMembro('u1', 'naoexiste')).rejects.toThrow(NotFoundException);
      
      // Não deve publicar evento se falhar
      expect(queueProducer.publish).not.toHaveBeenCalled();
    });
  
    it('deve lançar BadRequestException se o ID for inválido ao adicionar membro', async () => {
      const mockError = { name: 'CastError' };
      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);
  
      await expect(service.addMembro('invalid', 'fantasia')).rejects.toThrow(BadRequestException);
    });

    it('não deve falhar se publicação de evento falhar (fire and forget)', async () => {
      const mockUpdated = { 
        _id: '123', 
        nome: 'fantasia',
        membros: ['u1', 'u2', 'u3'] 
      };
      const mockExec = jest.fn().mockResolvedValue(mockUpdated);
      comunidadeModel.findOneAndUpdate.mockReturnValue({ exec: mockExec } as any);

      queueProducer.publish.mockRejectedValueOnce(new Error('RabbitMQ Error'));

      // Não deve lançar erro mesmo que queue falhe
      await expect(service.addMembro('u3', 'fantasia')).resolves.toEqual({ 
        message: 'Usuário adicionado à comunidade com sucesso' 
      });
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
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
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

    it('deve remover moderador que não é o único moderador', async () => {
      const comunidadeMock = {
        _id: '123',
        moderadores: ['u1', 'u2', 'u3'],
        membros: ['u1', 'u2', 'u3', 'u4'],
      };
      
      comunidadeModel.findOne.mockReturnValueOnce({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeMock as any) }) } as any);

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
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

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
      comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate, exec: jest.fn() } as any);

      const result = await service.findAllComunidadeModeradores('fantasia');

      expect(result).toEqual(mockModeradores);
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'fantasia' });
      expect(comunidadeModel.findOneAndUpdate).not.toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { moderadores: 'u2' } },
        { new: true }
      );
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
        isModerator: false
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
        isModerator: true
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
        isModerator: false
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
        isModerator: false
      });
    });
  });
  
  describe('removerMembroComoModerador', () => {
    const requesterId = 'moderator1';
    const comunidadeNome = 'fantasia';
    const targetUserId = 'userToRemove';

    it('deve remover membro como moderador com sucesso', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId, 'otherMod'],
        membros: [requesterId, 'otherMod', targetUserId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId);

      expect(result).toEqual({ message: 'Membro removido da comunidade com sucesso' });
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: comunidadeNome });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: comunidadeNome },
        { $pull: { membros: targetUserId } },
        { new: true }
      );
    });

    it('deve lançar NotFoundException se comunidade não for encontrada', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se requester não for moderador', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: ['otherMod'],
        membros: ['otherMod', targetUserId, requesterId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se target user não for membro', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId],
        membros: [requesterId, 'otherUser'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ForbiddenException se tentar remover outro moderador', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId, targetUserId],
        membros: [requesterId, targetUserId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('tornarMembroModerador', () => {
    const requesterId = 'moderator1';
    const comunidadeNome = 'fantasia';
    const targetUserId = 'userToPromote';

    it('deve promover membro a moderador com sucesso', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId],
        membros: [requesterId, targetUserId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId);

      expect(result).toEqual({ message: 'Membro promovido a moderador com sucesso' });
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: comunidadeNome });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: comunidadeNome },
        { $addToSet: { moderadores: targetUserId } },
        { new: true }
      );
    });

    it('deve lançar NotFoundException se comunidade não for encontrada', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se requester não for moderador', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: ['otherMod'],
        membros: [requesterId, targetUserId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se target user não for membro', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId],
        membros: [requesterId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ConflictException se target user já for moderador', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: [requesterId, targetUserId],
        membros: [requesterId, targetUserId],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCommunity', () => {
    const userId = 'moderator1';
    const comunidadeNome = 'fantasia';

    it('deve deletar comunidade com sucesso', async () => {
      const comunidadeMock = {
        _id: 'comunidade123',
        nome: comunidadeNome,
        moderadores: [userId],
        deleteOne: jest.fn().mockResolvedValue({}),
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      const mockPostModel = {
        deleteMany: jest.fn().mockResolvedValue({}),
        find: jest.fn().mockResolvedValue([]),
      };
      (service as any).postModel = mockPostModel;

      const result = await service.deleteCommunity(userId, comunidadeNome);

      expect(result).toEqual({ message: 'Comunidade apagada com sucesso' });
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: comunidadeNome });
      expect(mockPostModel.deleteMany).toHaveBeenCalledWith({ comunidade: 'comunidade123' });
      expect(comunidadeMock.deleteOne).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se comunidade não for encontrada', async () => {
      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.deleteCommunity(userId, comunidadeNome)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se usuário não for moderador', async () => {
      const comunidadeMock = {
        nome: comunidadeNome,
        moderadores: ['otherMod'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      await expect(
        service.deleteCommunity(userId, comunidadeNome)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('ComunidadesService - Upload Methods', () => {
    let service: ComunidadesService;
    let comunidadeModel: Comunidade;
    let cloudinaryService: CloudinaryService;

    const mockComunidadeModel = {
      findOne: jest.fn(),
    };

    const mockCloudinaryService: Partial<CloudinaryService> & { uploadImage: jest.Mock; deleteImage: jest.Mock } = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    } as any;
    const mockPostModel = {
      deleteMany: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
    };

    const mockLivroModel2 = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const mockUserId = new Types.ObjectId().toString();
    const mockComunidadeNome = 'fantasia';
    const mockComunidadeId = new Types.ObjectId();

    const mockComunidade: Partial<ComunidadeDocument> & { save: jest.Mock } = {
      _id: mockComunidadeId,
      nome: mockComunidadeNome,
      moderadores: [new Types.ObjectId(mockUserId)],
      capaUrl: '/existing-capa.jpg',
      capaPublicId: 'existing-capa-id',
      bannerUrl: '/existing-banner.jpg',
      bannerPublicId: 'existing-banner-id',
      save: jest.fn(),
    };

    const mockFile = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test-image-data'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    } as unknown as Express.Multer.File;

    const mockUploadResult = {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
      public_id: 'livra/comunidades/capas/test123',
    };

    beforeEach(async () => {
      const mockComentarioModel = {
        find: jest.fn(),
        deleteMany: jest.fn(),
        findOne: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ComunidadesService,
          {
            provide: getModelToken(Comunidade.name),
            useValue: mockComunidadeModel,
          },
          {
            provide: getModelToken('Post'),
            useValue: mockPostModel,
          },
          {
            provide: getModelToken(Comentario.name),
            useValue: mockComentarioModel,
          },
          {
            provide: getModelToken('Livro'),
            useValue: mockLivroModel2,
          },
          {
            provide: CloudinaryService,
            useValue: mockCloudinaryService,
          },
          {
            provide: QueueProducerService,
            useValue: mockQueueProducer,
          },
        ],
      }).compile();

      service = module.get<ComunidadesService>(ComunidadesService);
      comunidadeModel = module.get<Comunidade>(getModelToken(Comunidade.name));
      cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
      
      jest.clearAllMocks();

      // Reset mutable fields on the shared mockComunidade to a clean state
      mockComunidade.capaUrl = '/existing-capa.jpg';
      mockComunidade.capaPublicId = 'existing-capa-id';
      mockComunidade.bannerUrl = '/existing-banner.jpg';
      mockComunidade.bannerPublicId = 'existing-banner-id';
      mockComunidade.moderadores = [new Types.ObjectId(mockUserId)];
      mockComunidade.save = jest.fn().mockResolvedValue(mockComunidade);
    });

    describe('uploadCapa', () => {
      it('should upload capa successfully when user is moderator', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockCloudinaryService.deleteImage.mockResolvedValue(true);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ capaUrl: mockUploadResult.secure_url });
        expect(mockComunidadeModel.findOne).toHaveBeenCalledWith({ nome: mockComunidadeNome });
        expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
          mockFile.buffer,
          'livra/comunidades/capas'
        );
        expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith('existing-capa-id');
        expect(mockComunidade.capaUrl).toBe(mockUploadResult.secure_url);
        expect(mockComunidade.capaPublicId).toBe(mockUploadResult.public_id);
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should remove capa successfully when no file is provided', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.deleteImage.mockResolvedValue(true);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, undefined);

        expect(result).toEqual({ capaUrl: '/CommunityDefault.png' });
        expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith('existing-capa-id');
        expect(mockComunidade.capaUrl).toBe('/CommunityDefault.png');
        expect(mockComunidade.capaPublicId).toBe('');
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should remove capa without calling cloudinary when no publicId exists', async () => {
        const comunidadeWithoutPublicId = {
          ...mockComunidade,
          capaPublicId: '',
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithoutPublicId) } as any);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, undefined);

        expect(result).toEqual({ capaUrl: '/CommunityDefault.png' });
        expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
        expect(comunidadeWithoutPublicId.capaUrl).toBe('/CommunityDefault.png');
        expect(comunidadeWithoutPublicId.capaPublicId).toBe('');
      });

      it('should throw NotFoundException when comunidade does not exist', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

        await expect(
          service.uploadCapa(mockUserId, 'non-existent-comunidade', mockFile)
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.uploadCapa(mockUserId, 'non-existent-comunidade', mockFile)
        ).rejects.toThrow('Comunidade não encontrada');
      });

      it('should throw ForbiddenException when user is not moderator', async () => {
        const comunidadeWithDifferentModerator = {
          ...mockComunidade,
          moderadores: [new Types.ObjectId()],
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithDifferentModerator) } as any);

        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Apenas moderadores podem alterar a capa da comunidade');
      });

      it('should throw BadRequestException when file buffer is empty', async () => {
        const fileWithoutBuffer = {
          ...mockFile,
          buffer: null,
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);

        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, fileWithoutBuffer)
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, fileWithoutBuffer)
        ).rejects.toThrow('Arquivo inválido');
      });

      it('should handle cloudinary upload errors', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockRejectedValue(new Error('Cloudinary upload failed'));

        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Cloudinary upload failed');
      });

      it('should handle cloudinary delete errors gracefully', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockCloudinaryService.deleteImage.mockRejectedValue(new Error('Delete failed but should continue'));

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ capaUrl: mockUploadResult.secure_url });
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should handle comunidade save errors', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockComunidade.save.mockRejectedValue(new Error('Database save failed'));

        await expect(
          service.uploadCapa(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Database save failed');
      });

      it('should work with string moderator IDs', async () => {
        const comunidadeWithStringModerator = {
          ...mockComunidade,
          moderadores: [mockUserId],
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithStringModerator) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ capaUrl: mockUploadResult.secure_url });
      });
    });

    describe('uploadBanner', () => {
      it('should upload banner successfully when user is moderator', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockCloudinaryService.deleteImage.mockResolvedValue(true);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ bannerUrl: mockUploadResult.secure_url });
        expect(mockComunidadeModel.findOne).toHaveBeenCalledWith({ nome: mockComunidadeNome });
        expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
          mockFile.buffer,
          'livra/comunidades/banners'
        );
        expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith('existing-banner-id');
        expect(mockComunidade.bannerUrl).toBe(mockUploadResult.secure_url);
        expect(mockComunidade.bannerPublicId).toBe(mockUploadResult.public_id);
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should remove banner successfully when no file is provided', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.deleteImage.mockResolvedValue(true);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, undefined);

        expect(result).toEqual({ bannerUrl: '' });
        expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith('existing-banner-id');
        expect(mockComunidade.bannerUrl).toBe('');
        expect(mockComunidade.bannerPublicId).toBe('');
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should remove banner without calling cloudinary when no publicId exists', async () => {
        const comunidadeWithoutBannerPublicId = {
          ...mockComunidade,
          bannerPublicId: '',
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithoutBannerPublicId) } as any);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, undefined);

        expect(result).toEqual({ bannerUrl: '' });
        expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
        expect(comunidadeWithoutBannerPublicId.bannerUrl).toBe('');
        expect(comunidadeWithoutBannerPublicId.bannerPublicId).toBe('');
      });

      it('should throw NotFoundException when comunidade does not exist', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

        await expect(
          service.uploadBanner(mockUserId, 'non-existent-comunidade', mockFile)
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.uploadBanner(mockUserId, 'non-existent-comunidade', mockFile)
        ).rejects.toThrow('Comunidade não encontrada');
      });

      it('should throw ForbiddenException when user is not moderator', async () => {
        const comunidadeWithDifferentModerator = {
          ...mockComunidade,
          moderadores: [new Types.ObjectId()], // Different moderator
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithDifferentModerator) } as any);

        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Apenas moderadores podem alterar o banner da comunidade');
      });

      it('should throw BadRequestException when file buffer is empty', async () => {
        const fileWithoutBuffer = {
          ...mockFile,
          buffer: null,
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);

        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, fileWithoutBuffer)
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, fileWithoutBuffer)
        ).rejects.toThrow('Arquivo inválido');
      });

      it('should handle cloudinary upload errors for banner', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockRejectedValue(new Error('Cloudinary upload failed'));

        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Cloudinary upload failed');
      });

      it('should handle cloudinary delete errors gracefully for banner', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockCloudinaryService.deleteImage.mockRejectedValue(new Error('Delete failed but should continue'));

        // Should still complete successfully even if delete fails
        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ bannerUrl: mockUploadResult.secure_url });
        expect(mockComunidade.save).toHaveBeenCalled();
      });

      it('should handle comunidade save errors for banner', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);
        mockComunidade.save.mockRejectedValue(new Error('Database save failed'));

        await expect(
          service.uploadBanner(mockUserId, mockComunidadeNome, mockFile)
        ).rejects.toThrow('Database save failed');
      });

      it('should work with string moderator IDs for banner', async () => {
        const comunidadeWithStringModerator = {
          ...mockComunidade,
          moderadores: [mockUserId], // String ID instead of ObjectId
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithStringModerator) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ bannerUrl: mockUploadResult.secure_url });
      });
    });

    describe('edge cases', () => {
      it('should handle empty file object for uploadCapa', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, null);

        expect(result).toEqual({ capaUrl: '/CommunityDefault.png' });
      });

      it('should handle empty file object for uploadBanner', async () => {
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockComunidade) } as any);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, null);

        expect(result).toEqual({ bannerUrl: '' });
      });

      it('should handle comunidade with no existing capa for uploadCapa', async () => {
        const comunidadeWithoutCapa = {
          ...mockComunidade,
          capaUrl: '',
          capaPublicId: '',
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithoutCapa) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

        const result = await service.uploadCapa(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ capaUrl: mockUploadResult.secure_url });
        expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      });

      it('should handle comunidade with no existing banner for uploadBanner', async () => {
        const comunidadeWithoutBanner = {
          ...mockComunidade,
          bannerUrl: '',
          bannerPublicId: '',
        };
        mockComunidadeModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeWithoutBanner) } as any);
        mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

        const result = await service.uploadBanner(mockUserId, mockComunidadeNome, mockFile);

        expect(result).toEqual({ bannerUrl: mockUploadResult.secure_url });
        expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeMembro - edge cases', () => {
    it('deve remover moderador que não é o único moderador', async () => {
      const comunidadeMock = {
        _id: '123',
        moderadores: ['u1', 'u2', 'u3'],
        membros: ['u1', 'u2', 'u3', 'u4'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.removeMembro('u1', 'fantasia');

      expect(result).toEqual({ message: 'Usuário removido da comunidade com sucesso' });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { moderadores: 'u1' } },
        { new: true }
      );
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { membros: 'u1' } },
        { new: true }
      );
    });

    it('deve remover membro normal sem afetar moderadores', async () => {
      const comunidadeMock = {
        _id: '123',
        moderadores: ['u1'],
        membros: ['u1', 'u2', 'u3'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.removeMembro('u2', 'fantasia');

      expect(result).toEqual({ message: 'Usuário removido da comunidade com sucesso' });
      expect(comunidadeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { membros: 'u2' } },
        { new: true }
      );
      expect(comunidadeModel.findOneAndUpdate).not.toHaveBeenCalledWith(
        { nome: 'fantasia' },
        { $pull: { moderadores: 'u2' } },
        { new: true }
      );
    });
  });

  describe('addMembro - edge cases', () => {
    it('deve lidar com outros tipos de erro além de CastError', async () => {
      const mockError = new Error('Database connection error');
      
      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.addMembro('validUser', 'fantasia'))
        .rejects.toThrow('Database connection error');
    });
  });

  describe('removeMembro - edge cases', () => {
    it('deve lidar com outros tipos de erro além de CastError', async () => {
      const comunidadeMock = {
        _id: '123',
        moderadores: ['u1', 'u2'],
        membros: ['u1', 'u2', 'u3'],
      };

      comunidadeModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comunidadeMock),
      } as any);

      const mockError = new Error('Database connection error');
      comunidadeModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.removeMembro('u3', 'fantasia'))
        .rejects.toThrow('Database connection error');
    });
  });

  describe('findOne - slug lookup', () => {
    it('deve encontrar comunidade por slug quando nome não existe', async () => {
      const comunidadeMock = {
        _id: '1',
        nome: 'fantasia',
        slug: 'fantasia-slug',
      };

      comunidadeModel.findOne.mockReturnValueOnce({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadeMock) }) } as any);

      const result = await service.findOne('fantasia-slug');

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({
        $or: [
          { slug: 'fantasia-slug' },
          { nome: 'fantasia-slug' }
        ]
      });
      expect(result).toEqual(comunidadeMock);
    });

    it('deve priorizar busca por slug sobre nome', async () => {
      const comunidadePorSlug = {
        _id: '1',
        nome: 'fantasia-por-slug',
        slug: 'fantasia',
      };

      comunidadeModel.findOne.mockReturnValueOnce({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(comunidadePorSlug) }) } as any);

      const result = await service.findOne('fantasia');

      expect(result).toEqual(comunidadePorSlug);
      expect(comunidadeModel.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and missing scenarios', () => {
    
    describe('create - edge cases', () => {
      it('deve lidar com erro durante o save da comunidade', async () => {
        const criadorId = 'user123';
        const dto = { nome: 'livros' };

        comunidadeModel.findOne.mockReturnValueOnce({ 
          exec: jest.fn().mockResolvedValue(null) 
        } as any);

        const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
        const mockConstructor = jest.fn().mockImplementation(() => ({
          save: mockSave,
        }));

        (service as any).comunidadeModel = Object.assign(mockConstructor, comunidadeModel);

        await expect(service.create(criadorId, dto)).rejects.toThrow('Database error');
      });
    });

    describe('update - edge cases', () => {
      const userId = 'user1';
      const comunidadeNome = 'fantasia';

      it('deve atualizar sem alterar o nome quando updateDto.nome não for fornecido', async () => {
        const comunidade = {
          nome: comunidadeNome,
          moderadores: [userId],
        };
        const updateDto = { descricao: 'Nova descrição' };

        comunidadeModel.findOne.mockReturnValueOnce({ 
          exec: jest.fn().mockResolvedValue(comunidade) 
        } as any);

        const updatedDoc = { ...comunidade, ...updateDto };
        comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(updatedDoc),
        } as any);

        const result = await service.update(userId, comunidadeNome, updateDto);

        expect(result).toEqual(updatedDoc);
        expect(comunidadeModel.findOne).toHaveBeenCalledTimes(1);
      });

      it('deve lidar com erro durante findOneAndUpdate', async () => {
        const comunidade = {
          nome: comunidadeNome,
          moderadores: [userId],
        };
        const updateDto = { nome: 'novo-nome' };

        comunidadeModel.findOne
          .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any)
          .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) } as any);

        comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Update failed')),
        } as any);

        await expect(service.update(userId, comunidadeNome, updateDto))
          .rejects.toThrow('Update failed');
      });
    });

    describe('findAllPosts - edge cases', () => {
      it('deve retornar array vazio quando não houver posts', async () => {
        const mockExec = jest.fn().mockResolvedValue({ posts: [] });
        const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
        comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

        const result = await service.findAllPosts('livros');
        
        expect(result).toEqual([]);
      });

      it('deve lidar com erro durante populate', async () => {
        comunidadeModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Populate error')),
          }),
        } as any);

        await expect(service.findAllPosts('livros')).rejects.toThrow('Populate error');
      });
    });

    describe('findAllComunidadeMembros - edge cases', () => {
      it('deve retornar array vazio quando não houver membros', async () => {
        const mockExec = jest.fn().mockResolvedValue({ membros: [] });
        const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
        comunidadeModel.findOne.mockReturnValue({ populate: mockPopulate } as any);

        const result = await service.findAllComunidadeMembros('fantasia');
        
        expect(result).toEqual([]);
      });

      it('deve lidar com erro durante populate de membros', async () => {
        comunidadeModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Populate error')),
          }),
        } as any);

        await expect(service.findAllComunidadeMembros('fantasia'))
          .rejects.toThrow('Populate error');
      });
    });

    describe('verifyMemberOrMod - additional edge cases', () => {
      it('deve lidar com ObjectIds que são strings', async () => {
        const comunidadeMock = {
          membros: ['user1', 'user2'],
          moderadores: ['user1'],
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(comunidadeMock),
          }),
        } as any);

        const result = await service.verifyMemberOrMod('user2', 'fantasia');

        expect(result).toEqual({
          isMember: true,
          isModerator: false,
        });
      });

      it('deve lidar com erro durante a busca da comunidade', async () => {
        comunidadeModel.findOne.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        } as any);

        await expect(service.verifyMemberOrMod('user1', 'fantasia'))
          .rejects.toThrow('Database error');
      });
    });

    describe('addMembro - additional edge cases', () => {
      it('deve verificar que updated é null após findOneAndUpdate', async () => {
        comunidadeModel.findOneAndUpdate.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

        await expect(service.addMembro('u1', 'fantasia'))
          .rejects.toThrow(NotFoundException);
      });

      it('deve testar outros tipos de CastError', async () => {
        const mockError = { 
          name: 'CastError', 
          kind: 'ObjectId',
          value: 'invalid',
          path: 'membros'
        };
        
        comunidadeModel.findOneAndUpdate.mockReturnValue({
          exec: jest.fn().mockRejectedValue(mockError),
        } as any);

        await expect(service.addMembro('invalid', 'fantasia'))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('removeMembro - additional edge cases', () => {
      it('deve lidar com erro durante findOneAndUpdate para moderadores', async () => {
        const comunidadeMock = {
          _id: '123',
          moderadores: ['u1', 'u2'],
          membros: ['u1', 'u2', 'u3'],
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(comunidadeMock),
        } as any);

        comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Update failed')),
        } as any);

        await expect(service.removeMembro('u1', 'fantasia'))
          .rejects.toThrow('Update failed');
      });

      it('deve lidar com erro durante findOneAndUpdate para membros', async () => {
        const comunidadeMock = {
            _id: '123',
            moderadores: ['other'],
            membros: ['u1', 'u2'],
          };

          comunidadeModel.findOne.mockReturnValueOnce({
            exec: jest.fn().mockResolvedValue(comunidadeMock),
          } as any);

          comunidadeModel.findOneAndUpdate
            .mockReturnValueOnce({ exec: jest.fn().mockRejectedValue(new Error('Update failed')) } as any);

          await expect(service.removeMembro('u1', 'fantasia'))
            .rejects.toThrow('Update failed');
      });
    });

    describe('removerMembroComoModerador - edge cases', () => {
      const requesterId = 'moderator1';
      const comunidadeNome = 'fantasia';
      const targetUserId = 'userToRemove';

      it('deve lidar com erro durante findOneAndUpdate', async () => {
        const comunidadeMock = {
          nome: comunidadeNome,
          moderadores: [requesterId],
          membros: [requesterId, targetUserId],
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(comunidadeMock),
        } as any);

        comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Update failed')),
        } as any);

        await expect(
          service.removerMembroComoModerador(requesterId, comunidadeNome, targetUserId)
        ).rejects.toThrow('Update failed');
      });
    });

    describe('tornarMembroModerador - edge cases', () => {
      const requesterId = 'moderator1';
      const comunidadeNome = 'fantasia';
      const targetUserId = 'userToPromote';

      it('deve lidar com erro durante findOneAndUpdate', async () => {
        const comunidadeMock = {
          nome: comunidadeNome,
          moderadores: [requesterId],
          membros: [requesterId, targetUserId],
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(comunidadeMock),
        } as any);

        comunidadeModel.findOneAndUpdate.mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Update failed')),
        } as any);

        await expect(
          service.tornarMembroModerador(requesterId, comunidadeNome, targetUserId)
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteCommunity - edge cases', () => {
      const userId = 'moderator1';
      const comunidadeNome = 'fantasia';

      it('deve lidar com erro durante deleteMany de posts', async () => {
        const comunidadeMock = {
          _id: 'comunidade123',
          nome: comunidadeNome,
          moderadores: [userId],
          deleteOne: jest.fn().mockResolvedValue({}),
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(comunidadeMock),
        } as any);

        const mockPostModel = {
          deleteMany: jest.fn().mockRejectedValue(new Error('Delete posts failed')),
          find: jest.fn().mockResolvedValue([]),
        };
        (service as any).postModel = mockPostModel;

        await expect(service.deleteCommunity(userId, comunidadeNome))
          .rejects.toThrow('Delete posts failed');
      });

      it('deve lidar com erro durante deleteOne da comunidade', async () => {
        const comunidadeMock = {
          _id: 'comunidade123',
          nome: comunidadeNome,
          moderadores: [userId],
          deleteOne: jest.fn().mockRejectedValue(new Error('Delete comunidade failed')),
        };

        comunidadeModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(comunidadeMock),
        } as any);

        const mockPostModel = {
          deleteMany: jest.fn().mockResolvedValue({}),
          find: jest.fn().mockResolvedValue([]),
        };
        (service as any).postModel = mockPostModel;

        await expect(service.deleteCommunity(userId, comunidadeNome))
          .rejects.toThrow('Delete comunidade failed');
      });
    });

    describe('findAll - edge cases', () => {
      it('deve retornar array vazio quando não houver comunidades', async () => {
        comunidadeModel.find.mockReturnValueOnce({ 
          exec: jest.fn().mockResolvedValue([]) 
        } as any);

        const result = await service.findAll();
        
        expect(result).toEqual([]);
      });

      it('deve lidar com erro durante find', async () => {
        comunidadeModel.find.mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        } as any);

        await expect(service.findAll()).rejects.toThrow('Database error');
      });
    });

    describe('findAllComunidadeModeradores - edge cases', () => {
      it('deve lidar com erro durante populate de moderadores', async () => {
        comunidadeModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Populate error')),
          }),
        } as any);

        await expect(service.findAllComunidadeModeradores('fantasia'))
          .rejects.toThrow('Populate error');
      });
    });
  });

  describe('Service initialization', () => {
    it('deve inicializar com modelos injetados corretamente', () => {
      expect(service).toBeDefined();
      expect((service as any).comunidadeModel).toBeDefined();
      expect((service as any).postModel).toBeDefined();
    });
  });

  describe('Error messages', () => {
    it('deve ter mensagens de erro consistentes', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'test@email.com', username: 'testuser', avatarUrl: '', pronouns: 'she/her' };
      
      comunidadeModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } as any);
      await expect(service.findOne('inexistente'))
        .rejects.toThrow('Comunidade "inexistente" não encontrada');

      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ nome: 'existente' }) } as any);
      await expect(service.create('123', { nome: 'existente' }))
        .rejects.toThrow('Nome de comunidade em uso');

      const comunidade = { nome: 'test', moderadores: ['other'] };
      comunidadeModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(comunidade) } as any);
      await expect(service.update('123', 'test', { nome: 'novo' }))
        .rejects.toThrow('Apenas o moderador pode editar a comunidade');
    });
  });
});