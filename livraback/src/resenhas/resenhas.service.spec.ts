import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ResenhasService } from './resenhas.service';
import { Livro } from '../livros/entities/livro.schema';
import { Resenha } from './entities/resenha.schema';
import { CreateResenhaDto } from './dto/create-resenha.dto';
import { UpdateResenhaDto } from './dto/update-resenha.dto';

describe('ResenhasService', () => {
  let service: ResenhasService;
  let resenhaModel: Model<any>;
  let livroModel: Model<any>;

  const mockResenhaModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockLivroModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockUserId = new Types.ObjectId().toString();
  const mockBookId = new Types.ObjectId().toString();
  const mockResenhaId = new Types.ObjectId().toString();

  const mockBook = {
    _id: mockBookId,
    titulo: 'Test Book',
    resenhas: [],
  };

  const mockResenha = {
    _id: mockResenhaId,
    conteudo: 'Great book!',
    rating: 5,
    livro: mockBookId,
    autor: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    toString: () => mockResenhaId,
  };

  const mockCreateResenhaDto: CreateResenhaDto = {
    conteudo: 'Great book!',
    avaliacao: 5,
  };

  const mockUpdateResenhaDto: UpdateResenhaDto = {
    conteudo: 'Updated content',
    avaliacao: 4,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenhasService,
        {
          provide: getModelToken(Resenha.name),
          useValue: mockResenhaModel,
        },
        {
          provide: getModelToken(Livro.name),
          useValue: mockLivroModel,
        },
      ],
    }).compile();

    service = module.get<ResenhasService>(ResenhasService);
    resenhaModel = module.get<Model<any>>(getModelToken(Resenha.name));
    livroModel = module.get<Model<any>>(getModelToken(Livro.name));
    
    jest.clearAllMocks();
  });

  describe('getResenhasByBook', () => {
    it('should return resenhas for a book successfully', async () => {
      const mockResenhas = [mockResenha];
      
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockResenhas),
          }),
        }),
      });

      const result = await service.getResenhasByBook(mockBookId);

      expect(result).toEqual(mockResenhas);
      expect(mockLivroModel.findById).toHaveBeenCalledWith(mockBookId);
      expect(mockResenhaModel.find).toHaveBeenCalledWith({ livro: mockBookId });
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockLivroModel.findById.mockResolvedValue(null);

      await expect(service.getResenhasByBook(mockBookId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getResenhasByBook(mockBookId)).rejects.toThrow(
        'Livro não encontrado',
      );
    });

    it('should handle empty resenhas array', async () => {
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.getResenhasByBook(mockBookId);

      expect(result).toEqual([]);
      expect(mockLivroModel.findById).toHaveBeenCalledWith(mockBookId);
    });
  });

  describe('createResenha', () => {
    it('should create a resenha successfully', async () => {
      const newResenha = { ...mockResenha, _id: new Types.ObjectId() };
      
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findOne.mockResolvedValue(null);
      mockResenhaModel.create.mockResolvedValue(newResenha);
      mockLivroModel.findByIdAndUpdate.mockResolvedValue(mockBook);

      const result = await service.createResenha(
        mockUserId,
        mockBookId,
        mockCreateResenhaDto,
      );

      expect(result).toEqual(newResenha);
      expect(mockLivroModel.findById).toHaveBeenCalledWith(mockBookId);
      expect(mockResenhaModel.create).toHaveBeenCalledWith({
        ...mockCreateResenhaDto,
        livro: mockBookId,
        autor: mockUserId,
      });
      expect(mockLivroModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockBook._id,
        { $push: { resenhas: newResenha._id } },
      );
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockLivroModel.findById.mockResolvedValue(null);

      await expect(
        service.createResenha(mockUserId, mockBookId, mockCreateResenhaDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createResenha(mockUserId, mockBookId, mockCreateResenhaDto),
      ).rejects.toThrow('Livro não encontrado');
    });

    it('should handle database errors during creation', async () => {
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findOne.mockResolvedValue(null);
      mockResenhaModel.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createResenha(mockUserId, mockBookId, mockCreateResenhaDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateResenha', () => {
    it('should update a resenha successfully', async () => {
      const updatedResenha = { ...mockResenha, ...mockUpdateResenhaDto };
      
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockResenhaModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedResenha),
      });

      const result = await service.updateResenha(
        mockUserId,
        mockResenhaId,
        mockUpdateResenhaDto,
      );

      expect(result).toEqual(updatedResenha);
      expect(mockResenhaModel.findById).toHaveBeenCalledWith(mockResenhaId);
      expect(mockResenhaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockResenhaId,
        { $set: mockUpdateResenhaDto },
        { new: true },
      );
    });

    it('should throw NotFoundException when resenha does not exist', async () => {
      mockResenhaModel.findById.mockResolvedValue(null);

      await expect(
        service.updateResenha(mockUserId, mockResenhaId, mockUpdateResenhaDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateResenha(mockUserId, mockResenhaId, mockUpdateResenhaDto),
      ).rejects.toThrow('Resenha não encontrada');
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      const differentUserId = new Types.ObjectId().toString();
      const resenhaWithDifferentAuthor = {
        ...mockResenha,
        autor: differentUserId,
      };
      mockResenhaModel.findById.mockResolvedValue(resenhaWithDifferentAuthor);

      await expect(
        service.updateResenha(mockUserId, mockResenhaId, mockUpdateResenhaDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateResenha(mockUserId, mockResenhaId, mockUpdateResenhaDto),
      ).rejects.toThrow('Somente o autor da resenha pode atualizá-la');
    });

    it('should handle partial update data', async () => {
      const partialUpdate = { conteudo: 'Only content updated' };
      const updatedResenha = { ...mockResenha, ...partialUpdate };
      
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockResenhaModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedResenha),
      });

      const result = await service.updateResenha(
        mockUserId,
        mockResenhaId,
        partialUpdate,
      );

      expect(result).toEqual(updatedResenha);
      expect(mockResenhaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockResenhaId,
        { $set: partialUpdate },
        { new: true },
      );
    });

    it('should handle empty update data', async () => {
      const emptyUpdate = {};
      const updatedResenha = { ...mockResenha };
      
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockResenhaModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedResenha),
      });

      const result = await service.updateResenha(
        mockUserId,
        mockResenhaId,
        emptyUpdate,
      );

      expect(result).toEqual(updatedResenha);
      expect(mockResenhaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockResenhaId,
        { $set: emptyUpdate },
        { new: true },
      );
    });
  });

  describe('deleteResenha', () => {
    it('should delete a resenha successfully', async () => {
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findByIdAndDelete.mockResolvedValue(mockResenha);
      mockLivroModel.findByIdAndUpdate.mockResolvedValue(mockBook);

      const result = await service.deleteResenha(mockUserId, mockResenhaId);

      expect(result).toEqual({ message: 'Resenha apagada com sucesso' });
      expect(mockResenhaModel.findById).toHaveBeenCalledWith(mockResenhaId);
      expect(mockLivroModel.findById).toHaveBeenCalledWith(mockResenha.livro);
      expect(mockResenhaModel.findByIdAndDelete).toHaveBeenCalledWith(mockResenhaId);
      expect(mockLivroModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockResenha.livro,
        { $pull: { resenhas: mockResenha._id } },
      );
    });

    it('should throw NotFoundException when resenha does not exist', async () => {
      mockResenhaModel.findById.mockResolvedValue(null);

      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow('Resenha não encontrada');
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      const differentUserId = new Types.ObjectId().toString();
      const resenhaWithDifferentAuthor = {
        ...mockResenha,
        autor: new Types.ObjectId().toString(),
      };
      
      mockResenhaModel.findById.mockResolvedValue(resenhaWithDifferentAuthor);

      await expect(
        service.deleteResenha(differentUserId, mockResenhaId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.deleteResenha(differentUserId, mockResenhaId),
      ).rejects.toThrow('Somente o autor da resenha pode apagá-la');
    });

    it('should throw NotFoundException when livro does not exist', async () => {
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockLivroModel.findById.mockResolvedValue(null);

      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow('Livro não encontrado');
    });

    it('should handle database errors during deletion', async () => {
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow('Database error');
    });

    it('should handle Promise.all rejection', async () => {
      mockResenhaModel.findById.mockResolvedValue(mockResenha);
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

      await expect(
        service.deleteResenha(mockUserId, mockResenhaId),
      ).rejects.toThrow('Delete failed');
    });
  });
  describe('getResenhaById', () => {
      it('should return a resenha by id successfully', async () => {
        mockResenhaModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockResenha),
          }),
        });
        const result = await service.getResenhaById(mockResenhaId);
        expect(result).toEqual(mockResenha);
        expect(mockResenhaModel.findById).toHaveBeenCalledWith(mockResenhaId);
      });

      it('should throw NotFoundException if resenha not found', async () => {
        mockResenhaModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        });
        await expect(service.getResenhaById(mockResenhaId)).rejects.toThrow(NotFoundException);
        await expect(service.getResenhaById(mockResenhaId)).rejects.toThrow('Resenha não encontrada');
      });
    });

  describe('edge cases', () => {
    it('should handle different user ObjectId formats', async () => {
      const userIdAsObjectId = new Types.ObjectId();
      const updatedResenha = {
        _id: mockResenhaId,
        conteudo: mockUpdateResenhaDto.conteudo,
        avaliacao: mockUpdateResenhaDto.avaliacao,
        livro: mockBookId,
        autor: userIdAsObjectId.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockResenhaModel.findById.mockResolvedValue({
        autor: userIdAsObjectId.toString(),
        _id: mockResenhaId,
      });
      mockResenhaModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedResenha),
      });

      const result = await service.updateResenha(
        userIdAsObjectId.toString(),
        mockResenhaId,
        mockUpdateResenhaDto,
      );

      expect(result.autor).toEqual(userIdAsObjectId.toString());
      expect(result.conteudo).toEqual(mockUpdateResenhaDto.conteudo);
    });

    it('should handle resenha with string autor comparison', async () => {
      const stringUserId = 'user-123';
      const resenhaWithStringAutor = {
        ...mockResenha,
        autor: 'user-123',
      };
      
      mockResenhaModel.findById.mockResolvedValue(resenhaWithStringAutor);
      mockLivroModel.findById.mockResolvedValue(mockBook);
      mockResenhaModel.findByIdAndDelete.mockResolvedValue(resenhaWithStringAutor);
      mockLivroModel.findByIdAndUpdate.mockResolvedValue(mockBook);

      const result = await service.deleteResenha(stringUserId, mockResenhaId);

      expect(result).toEqual({ message: 'Resenha apagada com sucesso' });
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have models injected', () => {
      expect(resenhaModel).toBeDefined();
      expect(livroModel).toBeDefined();
    });
  });
});