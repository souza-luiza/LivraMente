import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUserDto } from '../auth/dto/current-user.dto';

class SessionAuthGuard {
  canActivate = jest.fn();
}

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;
  const mockUser: CurrentUserDto = {
    userId: 'user-123',
    username: 'user123',
    email: 'user@example.com',
    avatarUrl: '',
    pronouns: 'they/them',
  };

  const mockCommentsService = {
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    likeComment: jest.fn(),
    updateComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createComment', () => {
    const postId = 'post-123';
    const createCommentDto: CreateCommentDto = {
      conteudo: 'This is a test comment',
      imagens: ['image1.jpg', 'image2.jpg']
    };

    it('should create a comment successfully', async () => {
      const expectedResult = {
        id: 'comment-123',
        conteudo: createCommentDto.conteudo,
        autor: mockUser.userId,
        postId: postId
      };

      mockCommentsService.createComment.mockResolvedValue(expectedResult);

      const result = await controller.createComment(mockUser, postId, createCommentDto);

      expect(service.createComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        createCommentDto,
        undefined
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call service with correct parameters', async () => {
      await controller.createComment(mockUser, postId, createCommentDto);

      expect(service.createComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        createCommentDto,
        undefined
      );
    });
  });

  describe('deleteComment', () => {
    const commentId = 'comment-123';

    it('should delete a comment successfully', async () => {
      const expectedResult = { message: 'Comment deleted successfully' };
      mockCommentsService.deleteComment.mockResolvedValue(expectedResult);

      const result = await controller.deleteComment(mockUser, commentId);

      expect(service.deleteComment).toHaveBeenCalledWith(
        mockUser.userId,
        commentId
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call service with correct parameters', async () => {
      await controller.deleteComment(mockUser, commentId);

      expect(service.deleteComment).toHaveBeenCalledWith(
        mockUser.userId,
        commentId
      );
    });
  });

  describe('likeComment', () => {
    const commentId = 'comment-123';

    it('should like/unlike a comment successfully', async () => {
      const expectedResult = { 
        message: 'Comment liked successfully',
        likes: 5 
      };
      mockCommentsService.likeComment.mockResolvedValue(expectedResult);

      const result = await controller.likeComment(mockUser, commentId);

      expect(service.likeComment).toHaveBeenCalledWith(
        mockUser.userId,
        commentId
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call service with correct parameters', async () => {
      await controller.likeComment(mockUser, commentId);

      expect(service.likeComment).toHaveBeenCalledWith(
        mockUser.userId,
        commentId
      );
    });
  });

  describe('updateComment', () => {
    const postId = 'post-123';
    const commentId = 'comment-123';
    const updateCommentDto: UpdateCommentDto = {
      conteudo: 'Updated comment content',
      imagens: ['updated-image.jpg']
    };

    it('should update a comment successfully', async () => {
      const expectedResult = {
        id: commentId,
        conteudo: updateCommentDto.conteudo,
        imagens: updateCommentDto.imagens,
        updatedAt: new Date()
      };

      mockCommentsService.updateComment.mockResolvedValue(expectedResult);

      const result = await controller.updateComment(
        mockUser, 
        postId, 
        commentId, 
        updateCommentDto
      );

      expect(service.updateComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        commentId,
        updateCommentDto
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call service with correct parameters', async () => {
      await controller.updateComment(mockUser, postId, commentId, updateCommentDto);

      expect(service.updateComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        commentId,
        updateCommentDto
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateCommentDto = {
        conteudo: 'Only updating content'
      };

      await controller.updateComment(mockUser, postId, commentId, partialUpdate);

      expect(service.updateComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        commentId,
        partialUpdate
      );
    });
  });

  describe('error handling', () => {
    const postId = 'post-123';
    const commentId = 'comment-123';

    it('should handle service errors in createComment', async () => {
      const error = new Error('Service error');
      mockCommentsService.createComment.mockRejectedValue(error);

      await expect(
        controller.createComment(mockUser, postId, {} as CreateCommentDto)
      ).rejects.toThrow('Service error');
    });

    it('should handle service errors in deleteComment', async () => {
      const error = new Error('Delete failed');
      mockCommentsService.deleteComment.mockRejectedValue(error);

      await expect(
        controller.deleteComment(mockUser, commentId)
      ).rejects.toThrow('Delete failed');
    });

    it('should handle service errors in likeComment', async () => {
      const error = new Error('Like failed');
      mockCommentsService.likeComment.mockRejectedValue(error);

      await expect(
        controller.likeComment(mockUser, commentId)
      ).rejects.toThrow('Like failed');
    });

    it('should handle service errors in updateComment', async () => {
      const error = new Error('Update failed');
      mockCommentsService.updateComment.mockRejectedValue(error);

      await expect(
        controller.updateComment(mockUser, postId, commentId, {} as UpdateCommentDto)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('parameter validation', () => {
    it('should handle different parameter types correctly', async () => {
      const postId = '123';
      const commentId = '456';
      const updateCommentDto: UpdateCommentDto = { conteudo: 'Test' };

      await controller.updateComment(mockUser, postId, commentId, updateCommentDto);

      expect(service.updateComment).toHaveBeenCalledWith(
        mockUser.userId,
        postId,
        commentId,
        updateCommentDto
      );
    });
  });
});