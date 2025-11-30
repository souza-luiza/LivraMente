import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  BadRequestException, 
  ForbiddenException, 
  NotFoundException 
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { Comentario } from '../schemas/comentario.schema';
import { Post } from '../schemas/post.schema';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('CommentsService', () => {
  let service: CommentsService;
  // Use `any` for model variables in tests to avoid IntelliSense/type errors
  // because we inject plain mock objects (not full Mongoose models).
  let postModel: any;
  let comunidadeModel: any;
  let comentarioModel: any;
  let userModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPostId = '507f1f77bcf86cd799439012';
  const mockCommentId = '507f1f77bcf86cd799439013';
  const mockComunidadeId = '507f1f77bcf86cd799439014';

  const mockPostModel: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockComunidadeModel: any = {
    findById: jest.fn(),
  };

  const mockComentarioModel: any = jest.fn();
  mockComentarioModel.findById = jest.fn();
  mockComentarioModel.findOne = jest.fn();
  mockComentarioModel.findOneAndUpdate = jest.fn();
  mockComentarioModel.find = jest.fn();
  mockComentarioModel.findByIdAndDelete = jest.fn();
  mockComentarioModel.updateOne = jest.fn();
  mockComentarioModel.prototype = { save: jest.fn() };

  const mockUserModel: any = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
        {
          provide: getModelToken(Comunidade.name),
          useValue: mockComunidadeModel,
        },
        {
          provide: getModelToken(Comentario.name),
          useValue: mockComentarioModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        // provide a simple CloudinaryService mock so the service's constructor can resolve
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/img.jpg', public_id: 'public-id' }),
            deleteImage: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    comunidadeModel = module.get<Model<Comunidade>>(getModelToken(Comunidade.name));
    comentarioModel = module.get<Model<Comentario>>(getModelToken(Comentario.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));

    // default comentarioModel.find to an empty array to avoid undefined
    // when other services call .find(...).flatMap(...) on the result
    if (mockComentarioModel && typeof mockComentarioModel.find === 'function') {
      mockComentarioModel.find.mockResolvedValue([]);
    }

    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const createCommentDto: CreateCommentDto = {
      conteudo: 'This is a test comment',
    };

    const mockPost = {
      _id: new Types.ObjectId(mockPostId),
      comunidade: new Types.ObjectId(mockComunidadeId),
    };

    const mockComunidade = {
      _id: new Types.ObjectId(mockComunidadeId),
      membros: [new Types.ObjectId(mockUserId)],
    };

    beforeEach(() => {
      mockPostModel.findById.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockUserModel.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
    });

    it('should create a comment successfully', async () => {
      const mockComment = {
        _id: new Types.ObjectId(mockCommentId),
        ...createCommentDto,
        autor: new Types.ObjectId(mockUserId),
        post: new Types.ObjectId(mockPostId),
        save: jest.fn().mockResolvedValue(true),
      };

      const commentInstance = {
        ...mockComment,
        save: jest.fn().mockResolvedValue(mockComment),
      };

      // Ensure the constructor returns our instance and prototype.save exists
      mockComentarioModel.prototype.save = jest.fn().mockResolvedValue(mockComment);
      mockComentarioModel.mockImplementation(() => commentInstance);
      // make the injected referencia point to the same mock function
      comentarioModel = mockComentarioModel;

      const result = await service.createComment(mockUserId, mockPostId, createCommentDto);

      expect(postModel.findById).toHaveBeenCalledWith(mockPostId);
      // The service may call findById with an ObjectId instance; compare string form
      expect(comunidadeModel.findById).toHaveBeenCalled();
      const calledArg = comunidadeModel.findById.mock.calls[0][0];
      expect(String(calledArg)).toBe(mockComunidadeId);
      expect(result.message).toBe('Comentário criado com sucesso');
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockResolvedValue(null);

      await expect(
        service.createComment(mockUserId, mockPostId, createCommentDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);

      await expect(
        service.createComment(mockUserId, mockPostId, createCommentDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      const comunidadeWithoutUser = {
        ...mockComunidade,
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')],
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

      await expect(
        service.createComment(mockUserId, mockPostId, createCommentDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when content is empty', async () => {
      const invalidDto = { ...createCommentDto, conteudo: '' };

      await expect(
        service.createComment(mockUserId, mockPostId, invalidDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when more than 4 images are provided', async () => {
      const invalidDto = {
        ...createCommentDto,
        imagens: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
      };
      // pass imagens as the fourth argument (files) so the service checks length
      await expect(
        service.createComment(mockUserId, mockPostId, invalidDto, invalidDto.imagens as any)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteComment', () => {
    const mockComment = {
      _id: new Types.ObjectId(mockCommentId),
      autor: new Types.ObjectId(mockUserId),
      post: new Types.ObjectId(mockPostId),
    };

    const mockPost = {
      _id: new Types.ObjectId(mockPostId),
      comunidade: new Types.ObjectId(mockComunidadeId),
    };

    const mockComunidade = {
      _id: new Types.ObjectId(mockComunidadeId),
      moderadores: [new Types.ObjectId('507f1f77bcf86cd799439099')],
    };

    beforeEach(() => {
      mockComentarioModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockComment) });
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPost) });
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
    });

    it('should delete a comment successfully when user is owner', async () => {
      mockComentarioModel.findByIdAndDelete.mockResolvedValue(true);
      mockPostModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.deleteComment(mockUserId, mockCommentId);

      expect(comentarioModel.findById).toHaveBeenCalledWith(mockCommentId, 'autor post');
      expect(comentarioModel.findByIdAndDelete).toHaveBeenCalledWith(mockCommentId);
      expect(result.message).toBe('Comentário deletado com sucesso');
    });

    it('should delete a comment successfully when user is moderator', async () => {
      const comunidadeWithModerator = {
        ...mockComunidade,
        moderadores: [new Types.ObjectId(mockUserId)],
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithModerator);

      mockComentarioModel.findByIdAndDelete.mockResolvedValue(true);
      mockPostModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.deleteComment(mockUserId, mockCommentId);

      expect(result.message).toBe('Comentário deletado com sucesso');
    });

    it('should throw NotFoundException when comment is not found', async () => {
      mockComentarioModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.deleteComment(mockUserId, mockCommentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.deleteComment(mockUserId, mockCommentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or moderator', async () => {
      const commentWithDifferentOwner = {
        ...mockComment,
        autor: new Types.ObjectId('507f1f77bcf86cd799439099'),
      };
      mockComentarioModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(commentWithDifferentOwner) });

      await expect(
        service.deleteComment(mockUserId, mockCommentId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likeComment', () => {
    const mockComment = {
      _id: new Types.ObjectId(mockCommentId),
      curtidas: [],
    };

    beforeEach(() => {
      mockComentarioModel.findById.mockResolvedValue(mockComment);
    });

    it('should like a comment when user has not liked it before', async () => {
      const updatedComment = {
        ...mockComment,
        curtidas: [new Types.ObjectId(mockUserId)],
        length: 1,
      };
      mockComentarioModel.findById.mockResolvedValueOnce(mockComment);
      mockComentarioModel.findById.mockResolvedValueOnce(updatedComment);
      mockComentarioModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.likeComment(mockUserId, mockCommentId);

      expect(comentarioModel.updateOne).toHaveBeenCalledWith(
        { _id: mockComment._id },
        { $addToSet: { curtidas: new Types.ObjectId(mockUserId) } }
      );
      expect(result.liked).toBe(true);
      expect(result.likeAmount).toBe(1);
    });

    it('should unlike a comment when user has already liked it', async () => {
      const commentWithLike = {
        ...mockComment,
        curtidas: [new Types.ObjectId(mockUserId)],
      };
      const updatedComment = {
        ...mockComment,
        curtidas: [],
        length: 0,
      };
      
      mockComentarioModel.findById.mockResolvedValueOnce(commentWithLike);
      mockComentarioModel.findById.mockResolvedValueOnce(updatedComment);
      mockComentarioModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.likeComment(mockUserId, mockCommentId);

      expect(comentarioModel.updateOne).toHaveBeenCalledWith(
        { _id: mockComment._id },
        { $pull: { curtidas: new Types.ObjectId(mockUserId) } }
      );
      expect(result.liked).toBe(false);
      expect(result.likeAmount).toBe(0);
    });

    it('should throw NotFoundException when comment is not found', async () => {
      mockComentarioModel.findById.mockResolvedValue(null);

      await expect(
        service.likeComment(mockUserId, mockCommentId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateComment', () => {
    const mockComment = {
      _id: new Types.ObjectId(mockCommentId),
      autor: new Types.ObjectId(mockUserId),
      post: new Types.ObjectId(mockPostId),
      conteudo: 'Old content',
      imagens: ['old-image.jpg'],
    };

    const mockPost = {
      _id: new Types.ObjectId(mockPostId),
      comunidade: new Types.ObjectId(mockComunidadeId),
    };

    const mockComunidade = {
      _id: new Types.ObjectId(mockComunidadeId),
      membros: [new Types.ObjectId(mockUserId)],
      moderadores: [],
    };

    const mockUpdatedComment = {
      _id: new Types.ObjectId(mockCommentId),
      autor: { username: 'testuser' },
      conteudo: 'Updated content',
      imagens: ['new-image.jpg'],
    };

    it('should successfully update a comment', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockComentarioModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUpdatedComment) });

      const result = await service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto);

      expect(mockComentarioModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(mockCommentId),
        post: new Types.ObjectId(mockPostId),
        autor: new Types.ObjectId(mockUserId),
      });

      expect(mockPostModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(mockPostId),
      });

      const calledArg = mockComunidadeModel.findById.mock.calls[0][0];
      expect(String(calledArg)).toBe(mockComunidadeId);

      expect(mockComentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new Types.ObjectId(mockCommentId),
          post: new Types.ObjectId(mockPostId),
          autor: new Types.ObjectId(mockUserId),
        },
        { $set: { conteudo: updateCommentDto.conteudo } },
        { new: true }
      );

      expect(result).toEqual({
        message: 'Comentário atualizado com sucesso',
        comment: mockUpdatedComment,
      });
    });

    it('should throw NotFoundException when comment is not found', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      mockComentarioModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);

      expect(mockComentarioModel.findOne).toHaveBeenCalled();
      expect(mockPostModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when post is not found', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);

      expect(mockComentarioModel.findOne).toHaveBeenCalled();
      expect(mockPostModel.findOne).toHaveBeenCalled();
      expect(mockComunidadeModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when comunidade is not found', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(null);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);

      expect(mockComentarioModel.findOne).toHaveBeenCalled();
      expect(mockPostModel.findOne).toHaveBeenCalled();
      expect(mockComunidadeModel.findById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not a member of the community', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      const comunidadeWithoutUser = {
        ...mockComunidade,
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')],
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(ForbiddenException);

      expect(mockComentarioModel.findOne).toHaveBeenCalled();
      expect(mockPostModel.findOne).toHaveBeenCalled();
      expect(mockComunidadeModel.findById).toHaveBeenCalled();
    });

    it('should throw BadRequestException when there is nothing to update', async () => {
      const updateCommentDto: UpdateCommentDto = {};

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(BadRequestException);

      expect(mockComentarioModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when content is empty', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: '',
        imagens: ['image.jpg'],
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(BadRequestException);

      expect(mockComentarioModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should ignore imagens field and update when imagens provided in dto', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Valid content',
        imagens: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
      } as any;

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);

      mockComentarioModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUpdatedComment) });

      const result = await service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto);

      expect(mockComentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new Types.ObjectId(mockCommentId),
          post: new Types.ObjectId(mockPostId),
          autor: new Types.ObjectId(mockUserId),
        },
        { $set: { conteudo: updateCommentDto.conteudo } },
        { new: true }
      );

      expect(result.comment).toBeDefined();
    });

    it('should handle updating only content without images', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content only',
      };

      const updatedCommentContentOnly = {
        ...mockUpdatedComment,
        conteudo: 'Updated content only',
        imagens: mockComment.imagens,
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockComentarioModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(updatedCommentContentOnly) });

      const result = await service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto);

      expect(mockComentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new Types.ObjectId(mockCommentId),
          post: new Types.ObjectId(mockPostId),
          autor: new Types.ObjectId(mockUserId),
        },
        { $set: updateCommentDto },
        { new: true }
      );

      expect(result.comment).toBeDefined();
      expect(result.comment!.conteudo).toBe('Updated content only');
    });

    it('should reject when attempting to update only images without content', async () => {
      const updateCommentDto: UpdateCommentDto = {
        imagens: ['new-image1.jpg', 'new-image2.jpg'],
      };

      const updatedCommentImagesOnly = {
        ...mockUpdatedComment,
        conteudo: mockComment.conteudo,
        imagens: ['new-image1.jpg', 'new-image2.jpg'],
      };

      mockComentarioModel.findOne.mockResolvedValue(mockComment);
      mockPostModel.findOne.mockResolvedValue(mockPost);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
      mockComentarioModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(updatedCommentImagesOnly) });

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto as any)
      ).rejects.toThrow();
    });

    it('should handle ObjectId conversion errors gracefully', async () => {
      const updateCommentDto: UpdateCommentDto = {
        conteudo: 'Updated content',
      };

      const invalidId = 'invalid-object-id';

      await expect(
        service.updateComment(invalidId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow();
      expect(mockComentarioModel.findOne).not.toHaveBeenCalled();
    });
  });

    describe('deleteComment - Edge cases', () => {
        it('should throw NotFoundException when comunidade is not found', async () => {
            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            };

            const mockPost = {
            _id: new Types.ObjectId(mockPostId),
            comunidade: { _id: new Types.ObjectId(mockComunidadeId) },
            };

            mockComentarioModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockComment),
            });
            mockPostModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockPost),
            });
            mockComunidadeModel.findById.mockResolvedValue(null);

            await expect(
            service.deleteComment(mockUserId, mockCommentId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should properly remove comment reference from post', async () => {
            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            };

            const mockPost = {
            _id: new Types.ObjectId(mockPostId),
            comunidade: { _id: new Types.ObjectId(mockComunidadeId) },
            };

            const mockComunidade = {
            _id: new Types.ObjectId(mockComunidadeId),
            moderadores: [],
            };

            mockComentarioModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockComment),
            });
            mockPostModel.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockPost),
            });
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            mockComentarioModel.findByIdAndDelete.mockResolvedValue(true);
            mockPostModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await service.deleteComment(mockUserId, mockCommentId);

            expect(postModel.updateOne).toHaveBeenCalledWith(
            { _id: mockComment.post },
            { $pull: { comentarios: mockComment._id } }
            );
        });
    });

    describe('likeComment - Edge cases', () => {
        it('should handle case where updated comment is not found after like operation', async () => {
            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            curtidas: [],
            };

            mockComentarioModel.findById
            .mockResolvedValueOnce(mockComment) // First call - comment exists
            .mockResolvedValueOnce(null); // Second call - updated comment not found

            mockComentarioModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await expect(
            service.likeComment(mockUserId, mockCommentId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should handle ObjectId comparison correctly for existing likes', async () => {
            const existingLikeUserId = new Types.ObjectId(mockUserId);
            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            curtidas: [existingLikeUserId],
            };

            const updatedComment = {
            ...mockComment,
            curtidas: [],
            length: 0,
            };

            mockComentarioModel.findById
            .mockResolvedValueOnce(mockComment)
            .mockResolvedValueOnce(updatedComment);
            mockComentarioModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            const result = await service.likeComment(mockUserId, mockCommentId);

            expect(result.liked).toBe(false);
            expect(comentarioModel.updateOne).toHaveBeenCalledWith(
            { _id: mockComment._id },
            { $pull: { curtidas: existingLikeUserId } }
            );
        });
    });

    describe('updateComment - Field filtering', () => {
        it('should only update allowed fields and ignore others', async () => {
            const updateCommentDto: any = {
            conteudo: 'Updated content',
            imagens: ['image1.jpg'],
            unauthorizedField: 'should be ignored',
            anotherInvalidField: 'also ignored',
            };

            const mockPost = {
            _id: new Types.ObjectId(mockPostId),
            comunidade: new Types.ObjectId(mockComunidadeId),
            };

            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            };

            const mockComunidade = {
            _id: new Types.ObjectId(mockComunidadeId),
            membros: [new Types.ObjectId(mockUserId)],
            };

            const expectedFilteredUpdate = {
            conteudo: 'Updated content',
            };

            mockPostModel.findById.mockResolvedValue(mockPost);
            mockComentarioModel.findById.mockResolvedValue(mockComment);
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            
            const updatedComment = {
            ...mockComment,
            ...expectedFilteredUpdate,
            };
            
            mockComentarioModel.findOneAndUpdate.mockReturnValue({
            populate: jest.fn().mockResolvedValue(updatedComment),
            });

            await service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto);

            expect(comentarioModel.findOneAndUpdate).toHaveBeenCalled();
            const callArgs = (comentarioModel.findOneAndUpdate as jest.Mock).mock.calls[0];
            expect(String(callArgs[0]._id)).toBe(mockCommentId);
            expect(String(callArgs[0].post)).toBe(mockPostId);
            expect(String(callArgs[0].autor)).toBe(mockUserId);
            expect(callArgs[1]).toEqual({ $set: expectedFilteredUpdate });
        });

        it('should update only content when images are not provided', async () => {
            const updateCommentDto: UpdateCommentDto = {
            conteudo: 'Updated content only',
            };

            const mockPost = {
            _id: new Types.ObjectId(mockPostId),
            comunidade: new Types.ObjectId(mockComunidadeId),
            };

            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            };

            const mockComunidade = {
            _id: new Types.ObjectId(mockComunidadeId),
            membros: [new Types.ObjectId(mockUserId)],
            };

            mockPostModel.findById.mockResolvedValue(mockPost);
            mockComentarioModel.findById.mockResolvedValue(mockComment);
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            
            const updatedComment = {
            ...mockComment,
            ...updateCommentDto,
            };
            
            mockComentarioModel.findOneAndUpdate.mockReturnValue({
            populate: jest.fn().mockResolvedValue(updatedComment),
            });

            await service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto);

            expect(comentarioModel.findOneAndUpdate).toHaveBeenCalled();
            const callArgs2 = (comentarioModel.findOneAndUpdate as jest.Mock).mock.calls[0];
            expect(String(callArgs2[0]._id)).toBe(mockCommentId);
            expect(String(callArgs2[0].post)).toBe(mockPostId);
            expect(String(callArgs2[0].autor)).toBe(mockUserId);
            expect(callArgs2[1]).toEqual({ $set: updateCommentDto });
        });
    });

    describe('createComment - Post reference', () => {
        it('should add comment reference to post after creation', async () => {
            const createCommentDto: CreateCommentDto = {
            conteudo: 'Test comment',
            imagens: [],
            };

            const mockPost = {
            _id: new Types.ObjectId(mockPostId),
            comunidade: new Types.ObjectId(mockComunidadeId),
            };

            const mockComunidade = {
            _id: new Types.ObjectId(mockComunidadeId),
            membros: [new Types.ObjectId(mockUserId)],
            };

            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            ...createCommentDto,
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            save: jest.fn().mockResolvedValue(true),
            };

            mockPostModel.findById.mockResolvedValue(mockPost);
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            mockUserModel.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
            });

            mockComentarioModel.prototype.save = jest.fn().mockResolvedValue(mockComment);
            mockComentarioModel.mockImplementation(() => ({
            ...mockComment,
            save: jest.fn().mockResolvedValue(mockComment),
            }));

            mockPostModel.findByIdAndUpdate.mockResolvedValue({});

            await service.createComment(mockUserId, mockPostId, createCommentDto);

            expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockPostId,
            { $push: { comentarios: mockComment._id } }
            );
        });
    });
});