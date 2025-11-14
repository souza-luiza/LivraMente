import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PostStatus, PostCategoria } from '../schemas/post.schema';
import { Types } from 'mongoose';

describe('PostsService', () => {
  let service: PostsService;

  // make the model a callable constructor so `new this.postModel()` works
  const mockPostModel: any = jest.fn();
  mockPostModel.findById = jest.fn();
  mockPostModel.findOne = jest.fn();
  mockPostModel.findByIdAndUpdate = jest.fn();
  mockPostModel.findByIdAndDelete = jest.fn();
  mockPostModel.findOneAndUpdate = jest.fn();
  mockPostModel.updateOne = jest.fn();
  mockPostModel.create = jest.fn();

  const mockComunidadeModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken('Post'), useValue: mockPostModel },
        { provide: getModelToken('Comunidade'), useValue: mockComunidadeModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully when user is a member', async () => {
      const userId = new Types.ObjectId().toString();
      const comunidadeId = new Types.ObjectId();

      const dto = {
        conteudo: 'Hello world',
        comunidade: comunidadeId.toString(),
        imagens: ['img1.png'],
      };

      const comunidade = { _id: comunidadeId, membros: [new Types.ObjectId(userId)], posts: [] };
      const savedPost: any = {
        _id: new Types.ObjectId(),
        autor: userId,
        comunidade: comunidadeId,
      };
      savedPost.save = jest.fn().mockResolvedValue(savedPost);
      savedPost.populate = jest.fn().mockResolvedValue(savedPost);

      mockComunidadeModel.findById.mockResolvedValue(comunidade);
      mockComunidadeModel.findOne.mockResolvedValue(comunidade);
      // ensure `new mockPostModel()` returns an object with save/populate
      mockPostModel.mockImplementation(() => savedPost);
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});
      mockComunidadeModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.createPost(userId, dto as any);
      expect(result).toBeDefined();
      expect(mockComunidadeModel.findById).toHaveBeenCalledWith(dto.comunidade);
      expect(savedPost.save).toHaveBeenCalled();
    });

    it('should throw if comunidade not found', async () => {
      mockComunidadeModel.findById.mockResolvedValue(null);
      mockComunidadeModel.findOne.mockResolvedValue(null);

      await expect(
        service.createPost('user123', { comunidade: 'invalid' } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not a member', async () => {
      const comunidade = { _id: '1', membros: [] };
      mockComunidadeModel.findById.mockResolvedValue(comunidade);
      mockComunidadeModel.findOne.mockResolvedValue(comunidade);

      await expect(
        service.createPost('user123', { comunidade: '1' } as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if more than 4 images', async () => {
      const comunidade = { _id: '1', membros: ['user123'] };
      mockComunidadeModel.findById.mockResolvedValue(comunidade);
      mockComunidadeModel.findOne.mockResolvedValue(comunidade);

      const dto = { comunidade: '1', imagens: ['1', '2', '3', '4', '5'] };

      await expect(service.createPost('user123', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('likePost', () => {
    it('should like a post if not liked before', async () => {
      const postId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const post = { curtidas: [], _id: postId };
      const updatedPost = { curtidas: [userId] };

      mockPostModel.findById
        .mockResolvedValueOnce(post) // initial find
        .mockResolvedValueOnce(updatedPost); // after update

      mockPostModel.updateOne.mockResolvedValue({});

      const result = await service.likePost(userId.toString(), postId.toString());
      expect(result.liked).toBe(true);
      expect(result.likeAmount).toBe(1);
      expect(mockPostModel.updateOne).toHaveBeenCalledWith(
        { _id: postId.toString() },
        { $addToSet: { curtidas: expect.any(Types.ObjectId) } },
      );
    });

    it('should unlike a post if already liked', async () => {
      const postId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const post = { curtidas: [userId] };
      const updatedPost = { curtidas: [] };

      mockPostModel.findById
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(updatedPost);

      mockPostModel.updateOne.mockResolvedValue({});

      const result = await service.likePost(userId.toString(), postId.toString());
      expect(result.liked).toBe(false);
      expect(result.likeAmount).toBe(0);
    });

    it('should throw if post not found', async () => {
      mockPostModel.findById.mockResolvedValueOnce(null);
      await expect(service.likePost('user', 'post')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removePost', () => {
    it('should delete post if user is author', async () => {
      const userId = new Types.ObjectId();
      const postId = new Types.ObjectId();
      const comunidadeId = new Types.ObjectId();
      const post = {
        _id: postId,
        autor: { _id: userId },
        comunidade: { _id: comunidadeId },
      };

      // simulate chainable .populate(...)
      mockPostModel.findById.mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(post) });
      mockPostModel.findByIdAndDelete.mockResolvedValue({});
      mockComunidadeModel.updateOne.mockResolvedValue({});
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.removePost(userId.toString(), postId.toString());
      expect(result.message).toBe('Post removido com sucesso');
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(postId.toString());
    });

    it('should throw if post not found', async () => {
      // simulate chainable .populate(...) resolving to null
      mockPostModel.findById.mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(null) });
      await expect(service.removePost('user', 'post')).rejects.toThrow(NotFoundException);
    });
  });
});