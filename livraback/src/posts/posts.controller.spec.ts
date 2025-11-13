import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    createPost: jest.fn(),
    likePost: jest.fn(),
    removePost: jest.fn(),
    updatePost: jest.fn(),
    moderatePost: jest.fn(),
  };

  const mockUser: CurrentUserDto = { userId: 'user123', email: 'user@email.com' };

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
});