import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostCategoria, PostStatus } from '../schemas/post.schema';

describe('PostsService', () => {
  let service: PostsService;

  const mockUser = { _id: 'user123', username: 'testuser' };
  const mockComunidade = {
    _id: 'comunidade123',
    nome: 'Test Community',
    criador: 'user123',
    moderadores: [],
    membros: ['user123'],
    posts: [],
  };

  const mockPost = {
    _id: 'post123',
    autor: 'user123',
    conteudo: 'Test post content',
    comunidade: 'comunidade123',
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
        populate: jest.fn().mockResolvedValue(mockPost),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({ ...mockPost, conteudo: 'Updated' }),
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockPost),
  };

  const mockComunidadeModel = {
    findById: jest.fn().mockResolvedValue(mockComunidade),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockComunidade),
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
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'comunidade123',
        imagens: ['image1.jpg'],
        solicitacao_revisao: false,
      };

      const mockSave = jest.fn().mockResolvedValue({
        ...mockPost,
        populate: jest.fn().mockResolvedValue(mockPost),
      });

      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any
      );

      const result = await customService.create('user123', createDto);
      
      expect(mockComunidadeModel.findById).toHaveBeenCalledWith('comunidade123');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw NotFoundException if community not found', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(null);

      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'invalid123',
      };

      await expect(service.create('user123', createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        membros: [],
        criador: 'otheruser',
      });

      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'comunidade123',
      };

      await expect(service.create('user123', createDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if more than 4 images', async () => {
      const createDto: CreatePostDto = {
        conteudo: 'Test post',
        comunidade: 'comunidade123',
        imagens: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
      };

      await expect(service.create('user123', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should set status to PENDENTE_MODERACAO if solicitacao_revisao is true', async () => {
      const createDto: CreatePostDto = {
        conteudo: 'Test fanart',
        comunidade: 'comunidade123',
        solicitacao_revisao: true,
      };

      const mockSave = jest.fn().mockResolvedValue({
        ...mockPost,
        status: PostStatus.PENDENTE_MODERACAO,
        populate: jest.fn().mockResolvedValue(mockPost),
      });

      const mockConstructor = jest.fn().mockImplementation((data) => ({
        ...data,
        save: mockSave,
      }));

      const customService = new PostsService(
        mockConstructor as any,
        mockComunidadeModel as any
      );

      await customService.create('user123', createDto);
      
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findAllByComunidade', () => {
    it('should return all published posts from a community', async () => {
      const result = await service.findAllByComunidade('comunidade123');
      
      expect(mockComunidadeModel.findById).toHaveBeenCalledWith('comunidade123');
      expect(mockPostModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });

    it('should throw NotFoundException if community not found', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce(null);

      await expect(service.findAllByComunidade('invalid123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPendentes', () => {
    it('should return pending posts for moderators', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: ['user123'],
      });

      const result = await service.findPendentes('comunidade123', 'user123');
      
      expect(mockPostModel.find).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if user is not moderator', async () => {
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: [],
        criador: 'otheruser',
      });

      await expect(service.findPendentes('comunidade123', 'user123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const result = await service.findOne('post123');
      
      expect(mockPostModel.findById).toHaveBeenCalledWith('post123');
      expect(result).toEqual(mockPost);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      mockPostModel.findById.mockReturnValueOnce(mockPost);

      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      const result = await service.update('user123', 'post123', updateDto);
      
      expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.conteudo).toBe('Updated');
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: 'otheruser',
      });

      const updateDto: UpdatePostDto = {
        conteudo: 'Updated content',
      };

      await expect(service.update('user123', 'post123', updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      mockPostModel.findById.mockResolvedValueOnce(mockPost);

      const result = await service.remove('user123', 'post123');
      
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith('post123');
      expect(result).toEqual({ message: 'Post removido com sucesso' });
    });

    it('should allow moderators to remove posts', async () => {
      mockPostModel.findById.mockResolvedValueOnce({
        ...mockPost,
        autor: 'otheruser',
      });
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: ['user123'],
      });

      const result = await service.remove('user123', 'post123');
      
      expect(result).toEqual({ message: 'Post removido com sucesso' });
    });
  });

  describe('moderarPost', () => {
    it('should approve a pending post', async () => {
      const pendingPost = {
        ...mockPost,
        status: PostStatus.PENDENTE_MODERACAO,
        save: jest.fn().mockResolvedValue(this),
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      mockPostModel.findById.mockResolvedValueOnce(pendingPost);
      mockComunidadeModel.findById.mockResolvedValueOnce({
        ...mockComunidade,
        moderadores: ['user123'],
      });

      const result = await service.moderarPost('user123', 'post123', PostCategoria.FANART, true);
      
      expect(pendingPost.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if post is not pending', async () => {
      mockPostModel.findById.mockResolvedValueOnce(mockPost);

      await expect(
        service.moderarPost('user123', 'post123', PostCategoria.FANART, true)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('curtirPost', () => {
    it('should add like to post', async () => {
      const postWithSave = {
        ...mockPost,
        curtidas: [],
        save: jest.fn().mockResolvedValue(this),
      };

      mockPostModel.findById.mockResolvedValueOnce(postWithSave);

      const result = await service.curtirPost('user123', 'post123');
      
      expect(postWithSave.save).toHaveBeenCalled();
      expect(result.jaCurtiu).toBe(true);
    });

    it('should remove like from post if already liked', async () => {
      const postWithSave = {
        ...mockPost,
        curtidas: ['user123'],
        save: jest.fn().mockResolvedValue(this),
      };

      mockPostModel.findById.mockResolvedValueOnce(postWithSave);

      const result = await service.curtirPost('user123', 'post123');
      
      expect(result.jaCurtiu).toBe(false);
    });
  });
});
