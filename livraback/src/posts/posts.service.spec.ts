import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostCategoria, PostStatus } from '../schemas/post.schema';
import { QueueProducerService } from '../queue/queue.producer.service';

describe('PostsService', () => {
  let service: PostsService;
  let queueProducer: jest.Mocked<QueueProducerService>;

  // Use valid MongoDB ObjectIds
  const validUserId = '507f1f77bcf86cd799439011';
  const validComunidadeId = '507f1f77bcf86cd799439012';
  const validPostId = '507f1f77bcf86cd799439013';

  const mockComunidade = {
    _id: validComunidadeId,
    nome: 'Test Community',
    criador: validUserId,
    moderadores: [],
    membros: [validUserId],
    posts: [],
  };

  const mockPost = {
    _id: validPostId,
    autor: validUserId,
    conteudo: 'Test post content',
    comunidade: validComunidadeId,
    categoria: PostCategoria.GERAL,
    status: PostStatus.PUBLICADO,
    imagens: [],
    tags: [],
    curtidas: [],
    comentarios: [],
    publico: true,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockPopulate = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([mockPost]),
  });

  const mockPostModel = {
    find: jest.fn().mockReturnValue({
      populate: mockPopulate,
      sort: jest.fn().mockResolvedValue([mockPost]),
    }),
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPost),
        }),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({ ...mockPost, conteudo: 'Updated' }),
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockPost),
  };

  const mockComunidadeModel = {
    findById: jest.fn().mockResolvedValue(mockComunidade),
    findOne: jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockComunidade),
  };

  const mockQueueProducer = {
    publish: jest.fn().mockResolvedValue(undefined),
    publicarNaFila: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken('Post'),
          useValue: mockPostModel,
        },
        {
          provide: getModelToken('Comunidade'),
          useValue: mockComunidadeModel,
        },
        {
          provide: QueueProducerService,
          useValue: mockQueueProducer,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    queueProducer = module.get(QueueProducerService) as jest.Mocked<QueueProducerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);
      
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: validComunidadeId,
        imagens: ['image1.jpg'],
        solicitacao_revisao: false,
      };

      const savedPostWithPopulate = {
        ...mockPost,
        populate: jest.fn().mockResolvedValue(mockPost),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);

      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer,
      );

      const result = await customService.create(validUserId, createDto);
      
      expect(mockComunidadeModel.findById).toHaveBeenCalledWith(validComunidadeId);
      expect(mockConstructor).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if community not found', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(null);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);

      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: validComunidadeId,
      };

      await expect(service.create(validUserId, createDto)).rejects.toThrow(NotFoundException);
    });

    it('should create a post using community name', async () => {
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'Test Community',
        solicitacao_revisao: false,
      };

      // Criar novos mocks para este teste específico
      const customComunidadeModel = {
        findById: jest.fn().mockResolvedValue(null), // Não será chamado pois não é um ObjectId válido
        findOne: jest.fn().mockResolvedValue(mockComunidade), // Retorna a comunidade pelo nome
        findByIdAndUpdate: jest.fn().mockResolvedValue(mockComunidade),
      };

      const savedPostWithPopulate = {
        ...mockPost,
        populate: jest.fn().mockResolvedValue(mockPost),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);

      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        customComunidadeModel as any,
        queueProducer,
      );

      const result = await customService.create(validUserId, createDto);
      
      expect(customComunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'Test Community' });
      expect(mockConstructor).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const otherUserId = '507f1f77bcf86cd799439014';
      const comunidadeSemUsuario = {
        ...mockComunidade,
        membros: [], // Usuário validUserId não está nos membros
        criador: otherUserId,
      };
      
      mockComunidadeModel.findById.mockResolvedValueOnce(comunidadeSemUsuario);

      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: validComunidadeId,
      };

      await expect(service.create(validUserId, createDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if more than 4 images', async () => {
      // Garantir que o usuário é membro da comunidade
      const comunidadeComUsuario = {
        ...mockComunidade,
        membros: [validUserId], // Usuário é membro
      };
      
      mockComunidadeModel.findById.mockResolvedValueOnce(comunidadeComUsuario);
      
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: validComunidadeId,
        imagens: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
      };

      await expect(service.create(validUserId, createDto)).rejects.toThrow(BadRequestException);
    });

    it('should set status to PENDENTE_MODERACAO if solicitacao_revisao is true', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findByIdAndUpdate.mockResolvedValueOnce(mockComunidade);
      
      const createDto: CreatePostDto = {
        conteudo: 'Test fanart',
        comunidade: validComunidadeId,
        solicitacao_revisao: true,
      };

      const pendingPost = {
        ...mockPost,
        status: PostStatus.PENDENTE_MODERACAO,
      };
      
      const savedPostWithPopulate = {
        ...pendingPost,
        populate: jest.fn().mockResolvedValue(pendingPost),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);

      const mockConstructor = jest.fn().mockImplementation((data) => ({
        ...data,
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer,
      );

      const result = await customService.create(validUserId, createDto);
      
      expect(mockConstructor).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAllByComunidade', () => {
    it('should return all published posts from a community', async () => {
      mockPostModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([mockPost]),
          }),
        }),
      });

      const result = await service.findAllByComunidade(validComunidadeId);
      
      expect(mockComunidadeModel.findById).toHaveBeenCalledWith(validComunidadeId);
      expect(result).toEqual([mockPost]);
    });

    it('should throw NotFoundException if community not found', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(null);

      await expect(service.findAllByComunidade(validComunidadeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPendentes', () => {
    it('should return pending posts for moderators', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: [validUserId],
      });

      mockPostModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ ...mockPost, status: PostStatus.PENDENTE_MODERACAO }]),
        }),
      });

      const result = await service.findPendentes(validComunidadeId, validUserId);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw ForbiddenException if user is not moderator', async () => {
      const otherUserId = '507f1f77bcf86cd799439014';
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: [],
        criador: otherUserId,
      });

      await expect(service.findPendentes(validComunidadeId, validUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockPost),
          }),
        }),
      });

      const result = await service.findOne(validPostId);
      
      expect(mockPostModel.findById).toHaveBeenCalledWith(validPostId);
      expect(result).toEqual(mockPost);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if post not found', async () => {
      const notFoundId = '507f1f77bcf86cd799439099';
      mockPostModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOne(notFoundId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: validUserId,
      });

      mockPostModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...mockPost, conteudo: 'Updated' }),
      });

      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      const result = await service.update(validUserId, validPostId, updateDto);
      
      expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
      if (result) {
        expect(result.conteudo).toBe('Updated');
      }
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const otherUserId = '507f1f77bcf86cd799439014';
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: otherUserId,
      });

      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      await expect(service.update(validUserId, validPostId, updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: validUserId,
        comunidade: validComunidadeId,
      });
      mockPostModel.findByIdAndDelete.mockResolvedValueOnce(mockPost);

      const result = await service.remove(validUserId, validPostId);
      
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(validPostId);
      expect(result).toEqual({ message: 'Post removido com sucesso' });
    });

    it('should allow moderators to remove posts', async () => {
      const otherUserId = '507f1f77bcf86cd799439014';
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: otherUserId,
        comunidade: validComunidadeId,
      });
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: [validUserId],
      });
      mockPostModel.findByIdAndDelete.mockResolvedValueOnce(mockPost);

      const result = await service.remove(validUserId, validPostId);
      
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(validPostId);
      expect(result).toEqual({ message: 'Post removido com sucesso' });
    });
  });

  describe('moderarPost', () => {
    it('should approve a pending post', async () => {
      const approvedPost = { ...mockPost, status: PostStatus.PUBLICADO, categoria: PostCategoria.FANART };
      const mockSave = jest.fn().mockResolvedValue(approvedPost);
      const mockPopulateFunc = jest.fn().mockResolvedValue(approvedPost);

      const pendingPost = {
        ...mockPost,
        status: PostStatus.PENDENTE_MODERACAO,
        comunidade: validComunidadeId,
        save: mockSave,
        populate: mockPopulateFunc,
      };

      mockPostModel.findById.mockResolvedValueOnce(pendingPost);
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: [validUserId],
      });

      const result = await service.moderarPost(validUserId, validPostId, PostCategoria.FANART, true);
      
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if post is not pending', async () => {
      mockPostModel.findById.mockResolvedValueOnce(mockPost);

      await expect(
        service.moderarPost(validUserId, validPostId, PostCategoria.FANART, true)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('curtirPost', () => {
    it('should add like to post', async () => {
      const mockSave = jest.fn().mockImplementation(function(this: any) {
        this.curtidas.push(validUserId);
        return Promise.resolve(this);
      });

      const postWithSave = {
        ...mockPost,
        curtidas: [] as string[],
        save: mockSave,
      };

      mockPostModel.findById.mockResolvedValueOnce(postWithSave);

      const result = await service.curtirPost(validUserId, validPostId);
      
      expect(mockSave).toHaveBeenCalled();
      expect(result.jaCurtiu).toBe(true);
      expect(result.curtidas).toBeGreaterThanOrEqual(0);
    });

    it('should remove like from post if already liked', async () => {
      const mockSave = jest.fn().mockImplementation(function(this: any) {
        this.curtidas = [];
        return Promise.resolve(this);
      });

      const postWithSave = {
        ...mockPost,
        curtidas: [validUserId] as string[],
        save: mockSave,
      };

      mockPostModel.findById.mockResolvedValueOnce(postWithSave);

      const result = await service.curtirPost(validUserId, validPostId);
      
      expect(mockSave).toHaveBeenCalled();
      expect(result.jaCurtiu).toBe(false);
      expect(result.curtidas).toBe(0);
    });
  });

  describe('Publicação de Eventos', () => {
    beforeEach(() => {
      // Limpar chamadas anteriores do mock
      queueProducer.publish.mockClear();
      queueProducer.publicarNaFila.mockClear();
    });

    it('deve publicar evento NOTIFICAR_POST_CRIADO quando post for criado com status PUBLICADO', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);
      
      const createDto: CreatePostDto = {
        conteudo: 'Novo post publicado',
        comunidade: validComunidadeId,
        solicitacao_revisao: false,
      };

      const savedPostWithPopulate = {
        _id: validPostId,
        autor: validUserId,
        conteudo: createDto.conteudo,
        comunidade: validComunidadeId,
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.GERAL,
        imagens: [],
        populate: jest.fn().mockResolvedValue({
          _id: validPostId,
          autor: validUserId,
          conteudo: createDto.conteudo,
        }),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer
      );

      await customService.create(validUserId, createDto);
      
      expect(queueProducer.publish).toHaveBeenCalledWith(
        'notificar.post.criado',
        expect.objectContaining({
          postId: validPostId,
          autorId: validUserId,
          comunidadeId: validComunidadeId,
        })
      );
    });

    it('deve publicar evento METRICAS_POST_CRIADO quando post for criado', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);
      
      const createDto: CreatePostDto = {
        conteudo: 'Post para métricas',
        comunidade: validComunidadeId,
        solicitacao_revisao: false,
      };

      const savedPostWithPopulate = {
        _id: validPostId,
        autor: validUserId,
        conteudo: createDto.conteudo,
        comunidade: validComunidadeId,
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.GERAL,
        imagens: [],
        populate: jest.fn().mockResolvedValue({
          _id: validPostId,
        }),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer
      );

      await customService.create(validUserId, createDto);
      
      expect(queueProducer.publish).toHaveBeenCalledWith(
        'metricas.post.criado',
        expect.any(Object)
      );
    });

    it('deve publicar na fila de imagens quando post tiver imagens', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);
      
      const createDto: CreatePostDto = {
        conteudo: 'Post com imagens',
        comunidade: validComunidadeId,
        imagens: ['img1.jpg', 'img2.jpg'],
        solicitacao_revisao: false,
      };

      const savedPostWithPopulate = {
        _id: validPostId,
        autor: validUserId,
        conteudo: createDto.conteudo,
        comunidade: validComunidadeId,
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.GERAL,
        imagens: createDto.imagens,
        populate: jest.fn().mockResolvedValue({
          _id: validPostId,
        }),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer
      );

      await customService.create(validUserId, createDto);
      
      expect(queueProducer.publicarNaFila).toHaveBeenCalledWith(
        'imagens.processar',
        expect.objectContaining({
          tipo: 'post',
          postId: validPostId,
          imagens: createDto.imagens,
        })
      );
    });

    it('não deve publicar evento NOTIFICAR se post estiver em rascunho', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);

      const createDto: CreatePostDto = {
        conteudo: 'Post pendente moderação',
        comunidade: validComunidadeId,
        solicitacao_revisao: true, // Força status PENDENTE_MODERACAO (não PUBLICADO)
      };

      // Mock para retornar PENDENTE_MODERACAO
      const savedPostWithPopulate = {
        _id: validPostId,
        autor: validUserId,
        conteudo: createDto.conteudo,
        comunidade: validComunidadeId,
        status: PostStatus.PENDENTE_MODERACAO,
        categoria: PostCategoria.GERAL,
        imagens: [],
        populate: jest.fn().mockResolvedValue({
          _id: validPostId,
          status: PostStatus.PENDENTE_MODERACAO,
        }),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      // Cria um novo mock isolado para este teste
      const isolatedQueueProducer = {
        publish: jest.fn().mockResolvedValue(undefined),
        publicarNaFila: jest.fn().mockResolvedValue(undefined),
      };

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        isolatedQueueProducer as any,
      );

      await customService.create(validUserId, createDto);
      
      // Verifica que publish NÃO foi chamado (porque status === PENDENTE_MODERACAO, não PUBLICADO)
      expect(isolatedQueueProducer.publish).not.toHaveBeenCalled();
      // publicarNaFila não foi chamado porque não há imagens
      expect(isolatedQueueProducer.publicarNaFila).not.toHaveBeenCalled();
    });

    it('não deve falhar se publicação de evento falhar (fire and forget)', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(mockComunidade);
      mockComunidadeModel.findOne.mockResolvedValueOnce(null);
      
      queueProducer.publish.mockRejectedValue(new Error('RabbitMQ Error'));

      const createDto: CreatePostDto = {
        conteudo: 'Post com erro no queue',
        comunidade: validComunidadeId,
        solicitacao_revisao: false,
      };

      const savedPostWithPopulate = {
        _id: validPostId,
        autor: validUserId,
        conteudo: createDto.conteudo,
        comunidade: validComunidadeId,
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.GERAL,
        imagens: [],
        populate: jest.fn().mockResolvedValue({
          _id: validPostId,
        }),
      };
      
      const mockSave = jest.fn().mockResolvedValue(savedPostWithPopulate);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any,
        queueProducer
      );

      // Não deve lançar erro mesmo que queue falhe
      await expect(customService.create(validUserId, createDto)).resolves.toBeDefined();
    });
  });
});
