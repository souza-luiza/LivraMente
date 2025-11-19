import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { PostCategoria, PostStatus } from '../schemas/post.schema';
import { CurrentUserDto } from '../auth/dto/current-user.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockUser: CurrentUserDto = { userId: 'user123', email: 'test@test.com' };
  
  const mockPost = {
    _id: 'post123',
    autor: mockUser,
    conteudo: 'Test post content',
    comunidade: { _id: 'comunidade123', nome: 'Test Community' },
    categoria: PostCategoria.GERAL,
    status: PostStatus.PUBLICADO,
    imagens: [],
    tags: [],
    curtidas: [],
    comentarios: [],
    publico: true,
    data_criacao: new Date(),
    data_atualizacao: new Date(),
  };

  const mockPostsService = {
    createPost: jest.fn(),
    likePost: jest.fn(),
    removePost: jest.fn(),
    updatePost: jest.fn(),
    moderatePost: jest.fn(),
    getPostById: jest.fn(),
    getComments: jest.fn(),
  };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'comunidade123',
        imagens: ['image1.jpg'],
      };

      mockPostsService.createPost.mockResolvedValue(mockPost);

      const result = await controller.create(mockUser, createDto);

      expect(service.createPost).toHaveBeenCalledWith('user123', createDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('curtirPost', () => {
    it('should toggle like on a post', async () => {
      const likeResponse = {
        message: 'Post curtido com sucesso',
        post: mockPost,
      };
      mockPostsService.likePost.mockResolvedValue(likeResponse);

      const result = await controller.curtirPost(mockUser, 'post123');

      expect(service.likePost).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(likeResponse);
    });

    it('should remove like from a post', async () => {
      const unlikeResponse = {
        message: 'Curtida removida com sucesso',
        post: mockPost,
      };
      mockPostsService.likePost.mockResolvedValue(unlikeResponse);

      const result = await controller.curtirPost(mockUser, 'post123');

      expect(service.likePost).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(unlikeResponse);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const deleteResponse = { message: 'Post removido com sucesso' };
      mockPostsService.removePost.mockResolvedValue(deleteResponse);

      const result = await controller.remove(mockUser, 'post123');

      expect(service.removePost).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      const updatedPost = { ...mockPost, conteudo: 'Updated content' };
      mockPostsService.updatePost.mockResolvedValue(updatedPost);

      const result = await controller.update(mockUser, 'post123', updateDto);

      expect(service.updatePost).toHaveBeenCalledWith('user123', 'post123', updateDto);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('moderatePost', () => {
    it('should approve a post with category', async () => {
      const moderarDto: ModerarPostDto = {
        aprovar: true,
        categoria: PostCategoria.FANART,
      };

      const approvedPost = { 
        ...mockPost, 
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.FANART,
      };
      mockPostsService.moderatePost.mockResolvedValue(approvedPost);

      const result = await controller.moderatePost(mockUser, 'post123', moderarDto);

      expect(service.moderatePost).toHaveBeenCalledWith('user123', 'post123', moderarDto);
      expect(result).toEqual(approvedPost);
    });

    it('should reject a post', async () => {
      const moderarDto: ModerarPostDto = {
        aprovar: false,
      };

      const rejectedPost = { 
        ...mockPost, 
        status: PostStatus.REJEITADO,
      };
      mockPostsService.moderatePost.mockResolvedValue(rejectedPost);

      const result = await controller.moderatePost(mockUser, 'post123', moderarDto);

      expect(service.moderatePost).toHaveBeenCalledWith('user123', 'post123', moderarDto);
      expect(result).toEqual(rejectedPost);
    });
  });

  describe('getPostById', () => {
    it('should return a post by id and community name', async () => {
      mockPostsService.getPostById.mockResolvedValue(mockPost);

      const result = await controller.getPostById('post123', 'Test Community');

      expect(service.getPostById).toHaveBeenCalledWith('post123', 'Test Community');
      expect(result).toEqual(mockPost);
    });
  });

  describe('getComments', () => {
    it('should return comments of a post', async () => {
      const mockComments = [
        {
          _id: 'comment1',
          autor: 'user456',
          conteudo: 'Great post!',
          data_criacao: new Date(),
        },
      ];
      mockPostsService.getComments.mockResolvedValue(mockComments);

      const result = await controller.getComments('post123');

      expect(service.getComments).toHaveBeenCalledWith('post123');
      expect(result).toEqual(mockComments);
    });
  });
});
