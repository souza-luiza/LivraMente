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

// Mock the external utility
jest.mock('../common/utils/text.utils', () => ({
  extractMentions: jest.fn(),
}));

import { extractMentions } from '../common/utils/text.utils';

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
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockComunidadeModel: any = {
    findById: jest.fn(),
  };

  // Make the comentario model a callable mock (constructor) so `new this.comentarioModel()` works
  const mockComentarioModel: any = jest.fn();
  mockComentarioModel.findById = jest.fn();
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
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    comunidadeModel = module.get<Model<Comunidade>>(getModelToken(Comunidade.name));
    comentarioModel = module.get<Model<Comentario>>(getModelToken(Comentario.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));

    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const createCommentDto: CreateCommentDto = {
      conteudo: 'This is a test comment',
      imagens: ['image1.jpg', 'image2.jpg'],
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
      (extractMentions as jest.Mock).mockReturnValue([]);
      // userModel.find(...).select(...) should resolve to an array
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
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')], // Different user
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

      await expect(
        service.createComment(mockUserId, mockPostId, invalidDto)
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
      moderadores: [new Types.ObjectId('507f1f77bcf86cd799439099')], // Different user (not moderator)
    };

    beforeEach(() => {
      // service.deleteComment expects chainable .populate() after findById
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
      // For delete flow, findById returns a chainable with populate(); simulate not found by resolving populate to null
      mockComentarioModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.deleteComment(mockUserId, mockCommentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is not found', async () => {
      // postModel.findById is chained with populate in delete flow
      mockPostModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await expect(
        service.deleteComment(mockUserId, mockCommentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or moderator', async () => {
      const commentWithDifferentOwner = {
        ...mockComment,
        autor: new Types.ObjectId('507f1f77bcf86cd799439099'), // Different user
      };
      // findById in delete flow is chained with populate()
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
      mockComentarioModel.findById.mockResolvedValueOnce(mockComment); // First call
      mockComentarioModel.findById.mockResolvedValueOnce(updatedComment); // Second call
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
      
      mockComentarioModel.findById.mockResolvedValueOnce(commentWithLike); // First call
      mockComentarioModel.findById.mockResolvedValueOnce(updatedComment); // Second call
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
    const updateCommentDto: UpdateCommentDto = {
      conteudo: 'Updated comment content',
      imagens: ['updated-image.jpg'],
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

    beforeEach(() => {
      mockPostModel.findById.mockResolvedValue(mockPost);
      mockComentarioModel.findById.mockResolvedValue(mockComment);
      mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
    });

    it('should update a comment successfully', async () => {
      const updatedComment = {
        ...mockComment,
        ...updateCommentDto,
      };
      // findOneAndUpdate is chained with .populate() in the service; return an object with populate
      mockComentarioModel.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(updatedComment) });

      const result = await service.updateComment(
        mockUserId,
        mockPostId,
        mockCommentId,
        updateCommentDto
      );

      expect(comentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockCommentId, autor: mockUserId },
        { $set: updateCommentDto },
        { new: true }
      );
      expect(result.message).toBe('Comentário atualizado com sucesso');
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostModel.findById.mockResolvedValue(null);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when comment is not found', async () => {
      mockComentarioModel.findById.mockResolvedValue(null);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when comment does not belong to post', async () => {
      const commentFromDifferentPost = {
        ...mockComment,
        post: new Types.ObjectId('507f1f77bcf86cd799439099'), // Different post
      };
      mockComentarioModel.findById.mockResolvedValue(commentFromDifferentPost);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the comment owner', async () => {
      const commentWithDifferentOwner = {
        ...mockComment,
        autor: new Types.ObjectId('507f1f77bcf86cd799439099'), // Different user
      };
      mockComentarioModel.findById.mockResolvedValue(commentWithDifferentOwner);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is not a community member', async () => {
      const comunidadeWithoutUser = {
        ...mockComunidade,
        membros: [new Types.ObjectId('507f1f77bcf86cd799439099')], // Different user
      };
      mockComunidadeModel.findById.mockResolvedValue(comunidadeWithoutUser);

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, updateCommentDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when more than 4 images are provided', async () => {
      const invalidDto = {
        ...updateCommentDto,
        imagens: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
      };

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, invalidDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no valid fields are provided', async () => {
      const emptyDto = {};

      await expect(
        service.updateComment(mockUserId, mockPostId, mockCommentId, emptyDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

    describe('createComment - Mentions', () => {
        it('should extract and save mentions when content contains usernames', async () => {
            const createCommentDto: CreateCommentDto = {
            conteudo: 'Hello @user1 and @user2!',
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

            const mentionedUsers = [
            { _id: new Types.ObjectId('507f1f77bcf86cd799439021') },
            { _id: new Types.ObjectId('507f1f77bcf86cd799439022') },
            ];

            mockPostModel.findById.mockResolvedValue(mockPost);
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            (extractMentions as jest.Mock).mockReturnValue(['user1', 'user2']);
            mockUserModel.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(mentionedUsers),
            });

            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            ...createCommentDto,
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            mencoes: mentionedUsers.map(u => u._id),
            save: jest.fn().mockResolvedValue(true),
            };

            mockComentarioModel.prototype.save = jest.fn().mockResolvedValue(mockComment);
            mockComentarioModel.mockImplementation(() => ({
            ...mockComment,
            save: jest.fn().mockResolvedValue(mockComment),
            }));

            const result = await service.createComment(mockUserId, mockPostId, createCommentDto);

            expect(extractMentions).toHaveBeenCalledWith(createCommentDto.conteudo);
            expect(userModel.find).toHaveBeenCalledWith({
            username: { $in: ['user1', 'user2'] }
            });
            expect(result.comment.mencoes).toHaveLength(2);
        });

        it('should handle empty mentions array when no usernames found', async () => {
            const createCommentDto: CreateCommentDto = {
            conteudo: 'Hello world!',
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

            mockPostModel.findById.mockResolvedValue(mockPost);
            mockComunidadeModel.findById.mockResolvedValue(mockComunidade);
            (extractMentions as jest.Mock).mockReturnValue([]);
            mockUserModel.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
            });

            const mockComment = {
            _id: new Types.ObjectId(mockCommentId),
            ...createCommentDto,
            autor: new Types.ObjectId(mockUserId),
            post: new Types.ObjectId(mockPostId),
            mencoes: [],
            save: jest.fn().mockResolvedValue(true),
            };

            mockComentarioModel.prototype.save = jest.fn().mockResolvedValue(mockComment);
            mockComentarioModel.mockImplementation(() => ({
            ...mockComment,
            save: jest.fn().mockResolvedValue(mockComment),
            }));

            await service.createComment(mockUserId, mockPostId, createCommentDto);

            expect(userModel.find).toHaveBeenCalledWith({ username: { $in: [] } });
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
            imagens: ['image1.jpg'],
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

            expect(comentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockCommentId, autor: mockUserId },
            { $set: expectedFilteredUpdate },
            { new: true }
            );
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

            expect(comentarioModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockCommentId, autor: mockUserId },
            { $set: updateCommentDto },
            { new: true }
            );
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
            (extractMentions as jest.Mock).mockReturnValue([]);
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