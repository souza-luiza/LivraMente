import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    createPost: jest.fn(),
    likePost: jest.fn(),
    removePost: jest.fn(),
    updatePost: jest.fn(),
    moderatePost: jest.fn(),
    getPostById: jest.fn(),
    getComments: jest.fn(),
  };

  const mockUser: CurrentUserDto = {
    userId: 'user123',
    username: 'testuser',
    email: 'user@email.com',
    avatarUrl: 'http://avatar.url/image.png',
    pronouns: 'they/them',
  };

  const mockPost = {
    id: 'post-123',
    title: 'Test Post',
    content: 'Test content',
    comunidadeNome: 'test-community',
    authorId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComments = [
    {
      id: 'comment-1',
      content: 'First comment',
      authorId: 'user-456',
      postId: 'post-123',
      createdAt: new Date(),
    },
    {
      id: 'comment-2',
      content: 'Second comment',
      authorId: 'user-789',
      postId: 'post-123',
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.createPost with correct params', async () => {
      const dto: CreatePostDto = {
        conteudo: 'Hello world',
        comunidade: 'comu123',
      } as any;

      const expectedResponse = { _id: 'post123' };
      mockPostsService.createPost.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockUser, dto);
      expect(service.createPost).toHaveBeenCalledWith(mockUser.userId, dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('curtirPost', () => {
    it('should call service.likePost with correct params', async () => {
      const expectedResponse = { liked: true, likeAmount: 1 };
      mockPostsService.likePost.mockResolvedValue(expectedResponse);

      const result = await controller.curtirPost(mockUser, 'post123');
      expect(service.likePost).toHaveBeenCalledWith(mockUser.userId, 'post123');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('remove', () => {
    it('should call service.removePost with correct params', async () => {
      const expectedResponse = { message: 'Post removido com sucesso' };
      mockPostsService.removePost.mockResolvedValue(expectedResponse);

      const result = await controller.remove(mockUser, 'post123');
      expect(service.removePost).toHaveBeenCalledWith(mockUser.userId, 'post123');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    it('should call service.updatePost with correct params', async () => {
      const dto: UpdatePostDto = { conteudo: 'Updated content' } as any;
      const expectedResponse = { message: 'Post atualizado com sucesso', post: {} };

      mockPostsService.updatePost.mockResolvedValue(expectedResponse);

      const result = await controller.update(mockUser, 'post123', dto);
      expect(service.updatePost).toHaveBeenCalledWith(mockUser.userId, 'post123', dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('moderatePost', () => {
    it('should call service.moderatePost with correct params', async () => {
      const dto: ModerarPostDto = { aprovar: true, categoria: 'GERAL' } as any;
      const expectedResponse = { message: 'Post moderado com sucesso', status: 'Aprovado' };

      mockPostsService.moderatePost.mockResolvedValue(expectedResponse);

      const result = await controller.moderatePost(mockUser, 'post123', dto);
      expect(service.moderatePost).toHaveBeenCalledWith(mockUser.userId, 'post123', dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getPostById', () => {
    const postId = 'post-123';
    const comunidadeNome = 'test-community';

    it('should return a post when found', async () => {

      mockPostsService.getPostById.mockResolvedValue(mockPost);

      const result = await controller.getPostById(postId, comunidadeNome);

      expect(result).toEqual(mockPost);
      expect(service.getPostById).toHaveBeenCalledWith(postId, comunidadeNome);
      expect(service.getPostById).toHaveBeenCalledTimes(1);
    });

    it('should call service with correct parameters', async () => {

      mockPostsService.getPostById.mockResolvedValue(mockPost);

      await controller.getPostById(postId, comunidadeNome);

      expect(service.getPostById).toHaveBeenCalledWith(
        postId,
        comunidadeNome
      );
    });

    it('should throw NotFoundException when post is not found', async () => {

      mockPostsService.getPostById.mockRejectedValue(new NotFoundException());

      await expect(
        controller.getPostById('invalid-id', comunidadeNome)
      ).rejects.toThrow(NotFoundException);
      
      expect(service.getPostById).toHaveBeenCalledWith('invalid-id', comunidadeNome);
    });

    it('should throw NotFoundException when community is not found', async () => {

      mockPostsService.getPostById.mockRejectedValue(new NotFoundException());

      await expect(
        controller.getPostById(postId, 'invalid-community')
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors properly', async () => {

      const error = new Error('Database error');
      mockPostsService.getPostById.mockRejectedValue(error);

      await expect(
        controller.getPostById(postId, comunidadeNome)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getComments', () => {
    const postId = 'post-123';

    it('should return comments when post exists', async () => {
      mockPostsService.getComments.mockResolvedValue(mockComments);

      const result = await controller.getComments(postId);

      expect(result).toEqual(mockComments);
      expect(service.getComments).toHaveBeenCalledWith(postId);
      expect(service.getComments).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when post has no comments', async () => {
      mockPostsService.getComments.mockResolvedValue([]);

      const result = await controller.getComments(postId);

      expect(result).toEqual([]);
      expect(service.getComments).toHaveBeenCalledWith(postId);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      
      mockPostsService.getComments.mockRejectedValue(new NotFoundException());

      await expect(
        controller.getComments('invalid-post-id')
      ).rejects.toThrow(NotFoundException);
      
      expect(service.getComments).toHaveBeenCalledWith('invalid-post-id');
    });

    it('should call service with correct post ID', async () => {
      
      mockPostsService.getComments.mockResolvedValue(mockComments);

      await controller.getComments(postId);

      expect(service.getComments).toHaveBeenCalledWith(postId);
    });

    it('should handle service errors properly', async () => {

      const error = new Error('Service error');
      mockPostsService.getComments.mockRejectedValue(error);

      await expect(
        controller.getComments(postId)
      ).rejects.toThrow('Service error');
    });

    it('should return comments with correct structure', async () => {

      mockPostsService.getComments.mockResolvedValue(mockComments);

      const result: any = await controller.getComments(postId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('authorId');
      expect(result[0]).toHaveProperty('postId');
      expect(result[0].postId).toBe(postId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in comunidadeNome', async () => {
      const specialCommunityName = 'comunidade-téstê-123';
      mockPostsService.getPostById.mockResolvedValue(mockPost);

      await controller.getPostById('post-123', specialCommunityName);

      expect(service.getPostById).toHaveBeenCalledWith(
        'post-123',
        specialCommunityName
      );
    });

    it('should handle very long post IDs', async () => {
      const longPostId = 'a'.repeat(100);
      mockPostsService.getComments.mockResolvedValue([]);

      await controller.getComments(longPostId);

      expect(service.getComments).toHaveBeenCalledWith(longPostId);
    });
  });
});