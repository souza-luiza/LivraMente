import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post, PostCategoria, PostStatus } from '../schemas/post.schema';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { Comentario } from '../schemas/comentario.schema';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { QueueProducerService } from '../queue/queue.producer.service';
import { ROUTING_KEYS, FILAS } from '../queue/queue.constants';

describe('PostsService', () => {
  let service: PostsService;
  let postModel: any;
  let comunidadeModel: any;
  let userModel: any;
  let comentarioModel: any;
  let queueProducer: jest.Mocked<QueueProducerService>;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPostId = '507f1f77bcf86cd799439012';
  const mockComunidadeId = '507f1f77bcf86cd799439013';
  const mockCommentId = '507f1f77bcf86cd799439014';
  const mockModeratorId = '507f1f77bcf86cd799439015';

  const mockObjectId = new Types.ObjectId(mockUserId);
  const mockPostObjectId = new Types.ObjectId(mockPostId);
  const mockComunidadeObjectId = new Types.ObjectId(mockComunidadeId);

  const mockComunidade = {
    _id: mockComunidadeObjectId,
    membros: [mockObjectId],
  };

  const mockSavedPost = {
    _id: mockPostObjectId,
    autor: mockObjectId,
    comunidade: mockComunidadeObjectId,
    conteudo: 'Test content',
    curtidas: [],
    populate: jest.fn().mockReturnThis(),
  };

  const createPostDto: CreatePostDto = {
    conteudo: 'Test content',
    comunidade: mockComunidadeId,
  };

  const updatePostDto: UpdatePostDto = {
    conteudo: 'Updated content',
  };

  const mockPost = {
    _id: mockPostObjectId,
    autor: { _id: mockObjectId },
    comunidade: { _id: mockComunidadeObjectId },
  };

  const mockUpdatedPost = {
    ...mockPost,
    conteudo: 'Updated content',
  };

  const mockPostModel: any = jest.fn();
  mockPostModel.findById = jest.fn();
  mockPostModel.findOne = jest.fn();
  mockPostModel.findOneAndUpdate = jest.fn();
  mockPostModel.prototype = { save: jest.fn() };
  mockPostModel.updateOne = jest.fn();
  mockPostModel.findByIdAndDelete = jest.fn();

  const mockComunidadeModel: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockUserModel: any = {
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockComentarioModel: any = {
    find: jest.fn(),
    lean: jest.fn(),
    deleteMany: jest.fn(),
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
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockComunidadeModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Comentario.name),
          useValue: mockComentarioModel,
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/img.jpg', public_id: 'public-id' }),
            deleteImage: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: QueueProducerService,
          useValue: mockQueueProducer,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    comunidadeModel = module.get<Model<Comunidade>>(getModelToken(Comunidade.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    comentarioModel = module.get<Model<Comentario>>(getModelToken(Comentario.name));

    // Ensure .find resolves to an array by default to avoid errors
    // in service code that calls .find(...).flatMap(...) or similar
    if (mockComentarioModel && typeof mockComentarioModel.find === 'function') {
      mockComentarioModel.find.mockResolvedValue([]);
    }
    queueProducer = module.get(QueueProducerService) as jest.Mocked<QueueProducerService>;

    jest.clearAllMocks();
  });

  describe('createPost', () => {
        // ...existing code...

        beforeEach(() => {
          mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
          mockComunidadeModel.findOne.mockResolvedValue(null);
        });

        it('should create a post successfully with comunidade ID', async () => {
          const postInstance = {
            ...mockSavedPost,
            save: jest.fn().mockResolvedValue(mockSavedPost),
          };

          (postModel as any).mockImplementation(() => postInstance);
          mockComunidadeModel.findByIdAndUpdate.mockResolvedValue({});
          mockUserModel.findByIdAndUpdate.mockResolvedValue({});

          const result = await service.createPost(mockUserId, createPostDto, []);

          expect(comunidadeModel.findById).toHaveBeenCalledWith(mockComunidadeId);
          expect(comunidadeModel.findOne).not.toHaveBeenCalled();
          expect(postInstance.save).toHaveBeenCalled();
      
          expect(queueProducer.publish).toHaveBeenCalledWith(
            ROUTING_KEYS.NOTIFICAR_POST_CRIADO,
            expect.objectContaining({
              postId: mockPostId,
              autorId: mockUserId,
              comunidadeId: mockComunidadeId,
            })
          );
          expect(queueProducer.publish).toHaveBeenCalledWith(
            ROUTING_KEYS.METRICAS_POST_CRIADO,
            expect.objectContaining({
              postId: mockPostId,
              comunidadeId: mockComunidadeId,
            })
          );
          // No images provided, so publicarNaFila should not be called
          expect(queueProducer.publicarNaFila).not.toHaveBeenCalled();
        });

        it('should create a post successfully with comunidade name when ID not found', async () => {
          mockComunidadeModel.findById.mockResolvedValue(null);
          mockComunidadeModel.findOne.mockResolvedValue(mockComunidade);

          const postInstance = {
            ...mockSavedPost,
            save: jest.fn().mockResolvedValue(mockSavedPost),
          };

          (postModel as any).mockImplementation(() => postInstance);
          mockComunidadeModel.findByIdAndUpdate.mockResolvedValue({});
          mockUserModel.findByIdAndUpdate.mockResolvedValue({});

          const result = await service.createPost(mockUserId, {
            ...createPostDto,
            comunidade: 'community-name',
          }, []);

          expect(comunidadeModel.findById).not.toHaveBeenCalled();
          expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'community-name' });
        });

        it('should throw NotFoundException when comunidade is not found', async () => {
          mockComunidadeModel.findById.mockResolvedValue(null);
          mockComunidadeModel.findOne.mockResolvedValue(null);

          await expect(
            service.createPost(mockUserId, createPostDto, [])
          ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not a member', async () => {
          const comunidadeWithoutUser = {
            ...mockComunidade,
            membros: [new Types.ObjectId('507f1f77bcf86cd799439099')],
          };
          mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

          await expect(
            service.createPost(mockUserId, createPostDto, [])
          ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException when more than 4 images are provided', async () => {
          const invalidDto = {
            ...createPostDto,
            imagens: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
          };

          // Pass imagens as the third arg (files) to trigger the service-side length check
          await expect(
            service.createPost(mockUserId, invalidDto, invalidDto.imagens as any)
          ).rejects.toThrow(BadRequestException);
        });

        it('should set status to PENDENTE_MODERACAO when solicitacao_revisao is true', async () => {
          const dtoWithReview = {
            ...createPostDto,
            solicitacao_revisao: true,
            categoria: PostCategoria.GERAL,
          };

          const postInstance = {
            save: jest.fn().mockResolvedValue({
              ...mockSavedPost,
              status: PostStatus.PENDENTE_MODERACAO,
              categoria: PostCategoria.GERAL,
              populate: jest.fn().mockReturnThis(),
            }),
          };

          (postModel as any).mockImplementation(() => postInstance);
          mockComunidadeModel.findByIdAndUpdate.mockResolvedValue({});
          mockUserModel.findByIdAndUpdate.mockResolvedValue({});

          await service.createPost(mockUserId, dtoWithReview, []);

          expect(postInstance.save).toHaveBeenCalled();
          expect(queueProducer.publish).not.toHaveBeenCalledWith(
            ROUTING_KEYS.NOTIFICAR_POST_CRIADO,
            expect.anything()
          );
        });

        it('should use default values when optional fields are not provided', async () => {
          const minimalDto = {
            conteudo: 'Test content',
            comunidade: mockComunidadeId,
          };

          const postInstance = {
            save: jest.fn().mockResolvedValue({
              ...mockSavedPost,
              imagens: [],
              tags: [],
              publico: true,
              populate: jest.fn().mockReturnThis(),
            }),
          };

          (postModel as any).mockImplementation(() => postInstance);
          mockComunidadeModel.findByIdAndUpdate.mockResolvedValue({});
          mockUserModel.findByIdAndUpdate.mockResolvedValue({});

          await service.createPost(mockUserId, minimalDto, []);

          expect(postInstance.save).toHaveBeenCalled();
        });
  });

  describe('likePost', () => {
    const mockPost = {
      _id: mockPostObjectId,
      autor: mockObjectId,
      curtidas: [],
    };

    beforeEach(() => {
      mockPostModel.findById.mockResolvedValue(mockPost);
      mockPostModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
    });

    it('should unlike a post when user has already liked it', async () => {
      const postWithLike = {
        ...mockPost,
        curtidas: [mockObjectId],
      };
      const updatedPost = {
        ...mockPost,
        curtidas: [],
      };
      mockPostModel.findById
        .mockResolvedValueOnce(postWithLike)
        .mockResolvedValueOnce(updatedPost);

      const result = await service.likePost(mockUserId, mockPostId);

      expect(postModel.updateOne).toHaveBeenCalledWith(
        { _id: mockPostId },
        { $pull: { curtidas: mockObjectId } }
      );
      expect(result.liked).toBe(false);
      expect(result.likeAmount).toBe(0);
      
      expect(queueProducer.publish).not.toHaveBeenCalled();
    });

  });
  describe('removePost', () => {
    const mockPost = {
      _id: mockPostObjectId,
      autor: { _id: mockObjectId },
      comunidade: { _id: mockComunidadeObjectId },
    };

    const mockComunidade = {
      _id: mockComunidadeObjectId,
      moderadores: [new Types.ObjectId(mockModeratorId)],
    };

    beforeEach(() => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPost) });
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockPostModel.findByIdAndDelete.mockResolvedValue({});
      mockComunidadeModel.updateOne.mockResolvedValue({});
      mockUserModel.updateOne.mockResolvedValue({});
    });

    it('should remove post successfully when user is owner', async () => {
      const result = await service.removePost(mockUserId, mockPostId);

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);
      expect(result.message).toBe('Post removido com sucesso');
    });

    it('should remove post successfully when user is moderator', async () => {
      const result = await service.removePost(mockModeratorId, mockPostId);

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);
      expect(result.message).toBe('Post removido com sucesso');
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.removePost(mockUserId, mockPostId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);
      const differentUser = '507f1f77bcf86cd799439099';

      await expect(
        service.removePost(differentUser, mockPostId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or moderator', async () => {
      const differentUser = '507f1f77bcf86cd799439099';
      await expect(
        service.removePost(differentUser, mockPostId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePost', () => {
    // ...existing code...

    beforeEach(() => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPost) });
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockPostModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUpdatedPost) });
    });

    it('should update post successfully', async () => {
      const result = await service.updatePost(mockUserId, mockPostId, updatePostDto);

      expect(postModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPostId, autor: mockObjectId },
        { $set: updatePostDto },
        { new: true }
      );
      expect(result.message).toBe('Post atualizado com sucesso');
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updatePost(mockUserId, mockPostId, updatePostDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const differentUserPost = {
        ...mockPost,
        autor: { _id: new Types.ObjectId('507f1f77bcf86cd799439099') },
      };
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(differentUserPost) });

      await expect(
        service.updatePost(mockUserId, mockPostId, updatePostDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);

      await expect(
        service.updatePost(mockUserId, mockPostId, updatePostDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not community member', async () => {
      const comunidadeWithoutUser = {
        ...mockComunidade,
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')],
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

      await expect(
        service.updatePost(mockUserId, mockPostId, updatePostDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when post is pending moderation', async () => {
      const pendingPost = {
        ...mockPost,
        status: PostStatus.PENDENTE_MODERACAO,
      };
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(pendingPost) });

      await expect(
        service.updatePost(mockUserId, mockPostId, updatePostDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when no valid fields are provided', async () => {
      const emptyDto = {};

      await expect(
        service.updatePost(mockUserId, mockPostId, emptyDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter allowed fields only', async () => {
      const dtoWithExtraFields = {
        ...updatePostDto,
        invalidField: 'should be ignored',
      };

      await service.updatePost(mockUserId, mockPostId, dtoWithExtraFields);

      expect(postModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPostId, autor: mockObjectId },
        { $set: updatePostDto },
        { new: true }
      );
    });
  });

  describe('moderatePost', () => {
    const moderarPostDto: ModerarPostDto = {
      aprovar: true,
      categoria: PostCategoria.GERAL,
    };

    const mockPost = {
      _id: mockPostObjectId,
      autor: { _id: mockObjectId },
      comunidade: { _id: mockComunidadeObjectId },
      solicitacao_revisao: true,
      save: jest.fn().mockResolvedValue(true),
    };

    const mockComunidade = {
      _id: mockComunidadeObjectId,
      moderadores: [new Types.ObjectId(mockModeratorId)],
    };

    beforeEach(() => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPost) });
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockPostModel.findByIdAndDelete.mockResolvedValue({});
      mockComunidadeModel.updateOne.mockResolvedValue({});
      mockUserModel.updateOne.mockResolvedValue({});
    });

    it('should approve post successfully', async () => {
      const result = await service.moderatePost(mockModeratorId, mockPostId, moderarPostDto);

      expect(mockPost.save).toHaveBeenCalled();
      expect(result.message).toBe('Post moderado com sucesso');
      expect(result.status).toBe('Aprovado');
      
      expect(queueProducer.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.NOTIFICAR_POST_MODERADO,
        expect.objectContaining({
          postId: mockPostId,
          autorId: mockUserId,
          aprovado: true,
          categoria: PostCategoria.GERAL,
        })
      );
    });

    it('should reject post successfully', async () => {
      const rejectDto = { aprovar: false } as any;
      
      const result = await service.moderatePost(mockModeratorId, mockPostId, rejectDto);

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);
      expect(result.message).toBe('Post moderado com sucesso');
      expect(result.status).toBe('Rejeitado');
      
      expect(queueProducer.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.NOTIFICAR_POST_MODERADO,
        expect.objectContaining({
          aprovado: false,
        })
      );
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.moderatePost(mockModeratorId, mockPostId, moderarPostDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);

      await expect(
        service.moderatePost(mockModeratorId, mockPostId, moderarPostDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not moderator', async () => {
      const comunidadeWithoutModerator = {
        ...mockComunidade,
        moderadores: [new Types.ObjectId('507f1f77bcf86cd799439099')],
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutModerator);

      await expect(
        service.moderatePost(mockUserId, mockPostId, moderarPostDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when approving without category', async () => {
      const invalidDto = { aprovar: true } as any;

      await expect(
        service.moderatePost(mockModeratorId, mockPostId, invalidDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPostById', () => {
    const communityName = 'test-community';
    const mockCommunity = {
      _id: mockComunidadeObjectId,
    };

    const mockPost = {
      _id: mockPostObjectId,
      comunidade: mockComunidadeObjectId,
      populate: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      mockComunidadeModel.findOne.mockResolvedValue(mockCommunity);
      mockPostModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPost),
        }),
      });
    });

    it('should get post by id successfully', async () => {
      const result = await service.getPostById(mockPostId, communityName);

      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: communityName });
      expect(postModel.findOne).toHaveBeenCalledWith({
        _id: mockPostId,
        comunidade: mockComunidadeObjectId,
      });
    });

    it('should throw NotFoundException when community is not found', async () => {
      mockComunidadeModel.findOne.mockResolvedValue(null);

      await expect(
        service.getPostById(mockPostId, communityName)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is not found in community', async () => {
      mockPostModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.getPostById(mockPostId, communityName)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    const mockPost = {
      _id: mockPostObjectId,
    };

    const mockComments = [
      { _id: mockCommentId, conteudo: 'Comment 1' },
      { _id: 'comment2', conteudo: 'Comment 2' },
    ];

    beforeEach(() => {
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComentarioModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockComments),
          }),
        }),
      });
    });

    it('should get comments successfully', async () => {
      const result = await service.getComments(mockPostId);

      expect(postModel.findOne).toHaveBeenCalledWith({ _id: mockPostId });
      expect(comentarioModel.find).toHaveBeenCalledWith({
        post: mockPostObjectId,
      });
      expect(result).toEqual(mockComments);
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findOne.mockResolvedValue(null);

      await expect(
        service.getComments(mockPostId)
      ).rejects.toThrow(NotFoundException);
    });
  });
});