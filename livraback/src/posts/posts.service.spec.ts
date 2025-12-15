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

describe('PostsService', () => {
  let service: PostsService;
  // use `any` for injected models in tests to avoid strict typing against plain mocks
  let postModel: any;
  let comunidadeModel: any;
  let userModel: any;
  let comentarioModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPostId = '507f1f77bcf86cd799439012';
  const mockComunidadeId = '507f1f77bcf86cd799439013';
  const mockCommentId = '507f1f77bcf86cd799439014';
  const mockModeratorId = '507f1f77bcf86cd799439015';

  const mockObjectId = new Types.ObjectId(mockUserId);
  const mockPostObjectId = new Types.ObjectId(mockPostId);
  const mockComunidadeObjectId = new Types.ObjectId(mockComunidadeId);

  // make post model a callable mock so tests can `mockImplementation` a constructor
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

    jest.clearAllMocks();
  });

  describe('createPost', () => {
    const createPostDto: CreatePostDto = {
      conteudo: 'Test post content',
      comunidade: mockComunidadeId,
      imagens: ['image1.jpg', 'image2.jpg'],
      tags: ['tag1', 'tag2'],
      publico: true,
    };

    const mockComunidade = {
      _id: mockComunidadeObjectId,
      membros: [mockObjectId],
    };

    const mockSavedPost = {
      _id: mockPostObjectId,
      ...createPostDto,
      autor: mockObjectId,
      comunidade: mockComunidadeObjectId,
      populate: jest.fn().mockReturnThis(),
    };

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

      const result = await service.createPost(mockUserId, createPostDto);

      expect(comunidadeModel.findById).toHaveBeenCalledWith(mockComunidadeId);
      expect(comunidadeModel.findOne).not.toHaveBeenCalled();
      expect(postInstance.save).toHaveBeenCalled();
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
      });

      expect(comunidadeModel.findById).not.toHaveBeenCalled();
      expect(comunidadeModel.findOne).toHaveBeenCalledWith({ nome: 'community-name' });
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);
      mockComunidadeModel.findOne.mockResolvedValue(null);

      await expect(
        service.createPost(mockUserId, createPostDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      const comunidadeWithoutUser = {
        ...mockComunidade,
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')],
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

      await expect(
        service.createPost(mockUserId, createPostDto)
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

      await service.createPost(mockUserId, dtoWithReview);

      expect(postInstance.save).toHaveBeenCalled();
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

      await service.createPost(mockUserId, minimalDto);

      expect(postInstance.save).toHaveBeenCalled();
    });
  });

  describe('likePost', () => {
    const mockPost = {
      _id: mockPostObjectId,
      curtidas: [],
    };

    beforeEach(() => {
      mockPostModel.findById.mockResolvedValue(mockPost);
      mockPostModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
    });

    it('should like a post when user has not liked it', async () => {
      const updatedPost = {
        ...mockPost,
        curtidas: [mockObjectId],
        length: 1,
      };
      mockPostModel.findById.mockResolvedValueOnce(mockPost).mockResolvedValueOnce(updatedPost);

      const result = await service.likePost(mockUserId, mockPostId);

      expect(postModel.updateOne).toHaveBeenCalledWith(
        { _id: mockPostId },
        { $addToSet: { curtidas: mockObjectId } }
      );
      expect(result.liked).toBe(true);
      expect(result.likeAmount).toBe(1);
    });

    it('should unlike a post when user has already liked it', async () => {
      const postWithLike = {
        ...mockPost,
        curtidas: [mockObjectId],
      };
      const updatedPost = {
        ...mockPost,
        curtidas: [],
        length: 0,
      };
      mockPostModel.findById.mockResolvedValueOnce(postWithLike).mockResolvedValueOnce(updatedPost);

      const result = await service.likePost(mockUserId, mockPostId);

      expect(postModel.updateOne).toHaveBeenCalledWith(
        { _id: mockPostId },
        { $pull: { curtidas: mockObjectId } }
      );
      expect(result.liked).toBe(false);
      expect(result.likeAmount).toBe(0);
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockResolvedValue(null);

      await expect(
        service.likePost(mockUserId, mockPostId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when updated post is not found', async () => {
      mockPostModel.findById.mockResolvedValueOnce(mockPost).mockResolvedValueOnce(null);

      await expect(
        service.likePost(mockUserId, mockPostId)
      ).rejects.toThrow(NotFoundException);
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
      // findById is used in service with .populate() chain, return an object whose
      // populate resolves to the mockPost
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPost) });
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockPostModel.findByIdAndDelete.mockResolvedValue({});
      mockComunidadeModel.updateOne.mockResolvedValue({});
      mockUserModel.updateOne.mockResolvedValue({});
      // default comentarioModel.find to an empty array to avoid undefined in flatMap
      mockComentarioModel.find.mockResolvedValue([]);
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
    const updatePostDto: UpdatePostDto = {
      conteudo: 'Updated content',
      tags: ['updated'],
      publico: false,
    };

    const mockPost = {
      _id: mockPostObjectId,
      autor: { _id: mockObjectId },
      comunidade: { _id: mockComunidadeObjectId },
      status: PostStatus.PUBLICADO,
    };

    const mockComunidade = {
      _id: mockComunidadeObjectId,
      membros: [mockObjectId],
    };

    const mockUpdatedPost = {
      ...mockPost,
      ...updatePostDto,
    };

    beforeEach(() => {
      // updatePost calls findById(...).populate(...)
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
        { $set: updatePostDto }, // Should not include invalidField
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
      // moderatePost uses findById(...).populate(...)
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
    });

    it('should reject post successfully', async () => {
      const rejectDto = { aprovar: false } as any;
      
      const result = await service.moderatePost(mockModeratorId, mockPostId, rejectDto);

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);
      expect(result.message).toBe('Post moderado com sucesso');
      expect(result.status).toBe('Rejeitado');
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
      const invalidDto = { aprovar: true } as any; // No category

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
      // Service calls findOne(...).populate(...).populate(...), so return a chainable
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
      // getComments only checks existence with findOne (no populate), so return the post directly
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