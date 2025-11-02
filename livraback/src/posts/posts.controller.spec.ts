import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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
    create: jest.fn(),
    findAllByComunidade: jest.fn(),
    findAllByCategoria: jest.fn(),
    findPendentes: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    moderarPost: jest.fn(),
    curtirPost: jest.fn(),
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

      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith('user123', createDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAllByComunidade', () => {
    it('should return all posts from a community', async () => {
      mockPostsService.findAllByComunidade.mockResolvedValue([mockPost]);

      const result = await controller.findAllByComunidade('comunidade123');

      expect(service.findAllByComunidade).toHaveBeenCalledWith('comunidade123', undefined);
      expect(result).toEqual([mockPost]);
    });

    it('should return posts with user context', async () => {
      mockPostsService.findAllByComunidade.mockResolvedValue([mockPost]);

      const result = await controller.findAllByComunidade('comunidade123', mockUser);

      expect(service.findAllByComunidade).toHaveBeenCalledWith('comunidade123', 'user123');
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findAllByCategoria', () => {
    it('should return posts filtered by category', async () => {
      const fanartPost = { ...mockPost, categoria: PostCategoria.FANART };
      mockPostsService.findAllByCategoria.mockResolvedValue([fanartPost]);

      const result = await controller.findAllByCategoria('comunidade123', PostCategoria.FANART);

      expect(service.findAllByCategoria).toHaveBeenCalledWith('comunidade123', PostCategoria.FANART);
      expect(result).toEqual([fanartPost]);
    });
  });

  describe('findPendentes', () => {
    it('should return pending posts for moderators', async () => {
      const pendingPost = { ...mockPost, status: PostStatus.PENDENTE_MODERACAO };
      mockPostsService.findPendentes.mockResolvedValue([pendingPost]);

      const result = await controller.findPendentes('comunidade123', mockUser);

      expect(service.findPendentes).toHaveBeenCalledWith('comunidade123', 'user123');
      expect(result).toEqual([pendingPost]);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('post123');

      expect(service.findOne).toHaveBeenCalledWith('post123');
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      const updatedPost = { ...mockPost, conteudo: 'Updated content' };
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update('post123', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('user123', 'post123', updateDto);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const deleteResponse = { message: 'Post removido com sucesso' };
      mockPostsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('post123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('moderarPost', () => {
    it('should approve a post with category', async () => {
      const moderarDto: ModerarPostDto = {
        aprovar: true,
        categoria: PostCategoria.FANART,
        motivo_rejeicao: undefined,
      };

      const approvedPost = { 
        ...mockPost, 
        status: PostStatus.PUBLICADO,
        categoria: PostCategoria.FANART,
      };
      mockPostsService.moderarPost.mockResolvedValue(approvedPost);

      const result = await controller.moderarPost('post123', mockUser, moderarDto);

      expect(service.moderarPost).toHaveBeenCalledWith(
        'user123',
        'post123',
        PostCategoria.FANART,
        true,
        undefined
      );
      expect(result).toEqual(approvedPost);
    });

    it('should reject a post with reason', async () => {
      const moderarDto: ModerarPostDto = {
        aprovar: false,
        categoria: undefined,
        motivo_rejeicao: 'Conteúdo inadequado',
      };

      const rejectedPost = { 
        ...mockPost, 
        status: PostStatus.REJEITADO,
      };
      mockPostsService.moderarPost.mockResolvedValue(rejectedPost);

      const result = await controller.moderarPost('post123', mockUser, moderarDto);

      expect(service.moderarPost).toHaveBeenCalledWith(
        'user123',
        'post123',
        undefined,
        false,
        'Conteúdo inadequado'
      );
      expect(result).toEqual(rejectedPost);
    });
  });

  describe('curtirPost', () => {
    it('should toggle like on a post', async () => {
      const likeResponse = {
        message: 'Like adicionado',
        totalCurtidas: 1,
        jaCurtiu: true,
      };
      mockPostsService.curtirPost.mockResolvedValue(likeResponse);

      const result = await controller.curtirPost('post123', mockUser);

      expect(service.curtirPost).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(likeResponse);
    });

    it('should remove like from a post', async () => {
      const unlikeResponse = {
        message: 'Like removido',
        totalCurtidas: 0,
        jaCurtiu: false,
      };
      mockPostsService.curtirPost.mockResolvedValue(unlikeResponse);

      const result = await controller.curtirPost('post123', mockUser);

      expect(service.curtirPost).toHaveBeenCalledWith('user123', 'post123');
      expect(result).toEqual(unlikeResponse);
    });
  });
});
