import { Test, TestingModule } from '@nestjs/testing';
import { ResenhasController } from './resenhas.controller';
import { ResenhasService } from './resenhas.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CreateResenhaDto } from './dto/create-resenha.dto';
import { UpdateResenhaDto } from './dto/update-resenha.dto';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ResenhasController', () => {
  let controller: ResenhasController;
  let service: ResenhasService;

  const mockResenhasService = {
    getResenhasByBook: jest.fn(),
    createResenha: jest.fn(),
    updateResenha: jest.fn(),
    deleteResenha: jest.fn(),
    getResenhaById: jest.fn(),
  };

  const mockCurrentUser: CurrentUserDto = {
    userId: 'user-123',
    email: 'user@example.com',
    username: 'Test User',
    avatarUrl: '',
    pronouns: 'he/him',
  };

  const mockResenha = {
    _id: 'resenha-123',
    conteudo: 'Ótimo livro!',
    rating: 5,
    autor: 'user-123',
    livro: 'book-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateResenhaDto: CreateResenhaDto = {
    conteudo: 'Ótimo livro!',
    avaliacao: 5,
  };

  const mockUpdateResenhaDto: UpdateResenhaDto = {
    conteudo: 'Conteúdo atualizado',
    avaliacao: 4,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResenhasController],
      providers: [
        {
          provide: ResenhasService,
          useValue: mockResenhasService,
        },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ResenhasController>(ResenhasController);
    service = module.get<ResenhasService>(ResenhasService);
    jest.clearAllMocks();
  });

  describe('getResenhasByBook', () => {
    it('should return resenhas for a book successfully', async () => {
      const bookId = 'book-123';
      const expectedResult = [mockResenha];
      mockResenhasService.getResenhasByBook.mockResolvedValue(expectedResult);

      const result = await controller.getResenhasByBook(bookId);

      expect(result).toEqual(expectedResult);
      expect(service.getResenhasByBook).toHaveBeenCalledWith(bookId);
      expect(service.getResenhasByBook).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing NotFoundException', async () => {
      const bookId = 'non-existent-book';
      mockResenhasService.getResenhasByBook.mockRejectedValue(
        new NotFoundException('Livro não encontrado'),
      );

      await expect(controller.getResenhasByBook(bookId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getResenhasByBook).toHaveBeenCalledWith(bookId);
    });

    it('should handle service throwing other errors', async () => {
      const bookId = 'book-123';
      mockResenhasService.getResenhasByBook.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getResenhasByBook(bookId)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('getResenha', () => {
    it('should return a resenha by id successfully', async () => {
      const resenhaId = 'resenha-123';
      const expectedResult = mockResenha;
      mockResenhasService.getResenhaById.mockResolvedValue(expectedResult);

      const result = await controller.getResenha(resenhaId);

      expect(result).toEqual(expectedResult);
      expect(service.getResenhaById).toHaveBeenCalledWith(resenhaId);
      expect(service.getResenhaById).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing NotFoundException', async () => {
      const resenhaId = 'non-existent-resenha';
      mockResenhasService.getResenhaById.mockRejectedValue(
        new NotFoundException('Resenha não encontrada'),
      );

      await expect(controller.getResenha(resenhaId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getResenhaById).toHaveBeenCalledWith(resenhaId);
    });

    it('should handle service throwing other errors', async () => {
      const resenhaId = 'resenha-123';
      mockResenhasService.getResenhaById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getResenha(resenhaId)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('createResenha', () => {
    it('should create a resenha successfully', async () => {
      const bookId = 'book-123';
      const expectedResult = mockResenha;
      mockResenhasService.createResenha.mockResolvedValue(expectedResult);

      const result = await controller.createResenha(
        mockCurrentUser,
        bookId,
        mockCreateResenhaDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.createResenha).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        bookId,
        mockCreateResenhaDto,
      );
      expect(service.createResenha).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing NotFoundException', async () => {
      const bookId = 'non-existent-book';
      mockResenhasService.createResenha.mockRejectedValue(
        new NotFoundException('Livro não encontrado'),
      );

      await expect(
        controller.createResenha(mockCurrentUser, bookId, mockCreateResenhaDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle service throwing ForbiddenException', async () => {
      const bookId = 'book-123';
      mockResenhasService.createResenha.mockRejectedValue(
        new ForbiddenException('Ação não permitida'),
      );

      await expect(
        controller.createResenha(mockCurrentUser, bookId, mockCreateResenhaDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle service throwing other errors', async () => {
      const bookId = 'book-123';
      mockResenhasService.createResenha.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(
        controller.createResenha(mockCurrentUser, bookId, mockCreateResenhaDto),
      ).rejects.toThrow(Error);
    });
  });

  describe('updateResenha', () => {
    it('should update a resenha successfully', async () => {
      const resenhaId = 'resenha-123';
      const expectedResult = { ...mockResenha, ...mockUpdateResenhaDto };
      mockResenhasService.updateResenha.mockResolvedValue(expectedResult);

      const result = await controller.updateResenha(
        mockCurrentUser,
        resenhaId,
        mockUpdateResenhaDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.updateResenha).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        resenhaId,
        mockUpdateResenhaDto,
      );
      expect(service.updateResenha).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing NotFoundException', async () => {
      const resenhaId = 'non-existent-resenha';
      mockResenhasService.updateResenha.mockRejectedValue(
        new NotFoundException('Resenha não encontrada'),
      );

      await expect(
        controller.updateResenha(
          mockCurrentUser,
          resenhaId,
          mockUpdateResenhaDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle service throwing ForbiddenException', async () => {
      const resenhaId = 'resenha-123';
      mockResenhasService.updateResenha.mockRejectedValue(
        new ForbiddenException('Somente o autor da resenha pode atualizá-la'),
      );

      await expect(
        controller.updateResenha(
          mockCurrentUser,
          resenhaId,
          mockUpdateResenhaDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle service throwing other errors', async () => {
      const resenhaId = 'resenha-123';
      mockResenhasService.updateResenha.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.updateResenha(
          mockCurrentUser,
          resenhaId,
          mockUpdateResenhaDto,
        ),
      ).rejects.toThrow(Error);
    });

    it('should handle partial update data', async () => {
      const resenhaId = 'resenha-123';
      const partialUpdateDto: UpdateResenhaDto = {
        conteudo: 'Apenas conteúdo atualizado',
      };
      const expectedResult = { ...mockResenha, ...partialUpdateDto };
      mockResenhasService.updateResenha.mockResolvedValue(expectedResult);

      const result = await controller.updateResenha(
        mockCurrentUser,
        resenhaId,
        partialUpdateDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.updateResenha).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        resenhaId,
        partialUpdateDto,
      );
    });
  });

  describe('deleteResenha', () => {
    it('should delete a resenha successfully', async () => {
      const resenhaId = 'resenha-123';
      const expectedResult = { message: 'Resenha apagada com sucesso' };
      mockResenhasService.deleteResenha.mockResolvedValue(expectedResult);

      const result = await controller.deleteResenha(
        mockCurrentUser,
        resenhaId,
      );

      expect(result).toEqual(expectedResult);
      expect(service.deleteResenha).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        resenhaId,
      );
      expect(service.deleteResenha).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing NotFoundException', async () => {
      const resenhaId = 'non-existent-resenha';
      mockResenhasService.deleteResenha.mockRejectedValue(
        new NotFoundException('Resenha não encontrada'),
      );

      await expect(
        controller.deleteResenha(mockCurrentUser, resenhaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle service throwing ForbiddenException', async () => {
      const resenhaId = 'resenha-123';
      mockResenhasService.deleteResenha.mockRejectedValue(
        new ForbiddenException('Somente o autor da resenha pode apagá-la'),
      );

      await expect(
        controller.deleteResenha(mockCurrentUser, resenhaId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle service throwing other errors', async () => {
      const resenhaId = 'resenha-123';
      mockResenhasService.deleteResenha.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.deleteResenha(mockCurrentUser, resenhaId),
      ).rejects.toThrow(Error);
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have ResenhasService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockResenhasService);
    });
  });

  // Edge cases and additional coverage
  describe('edge cases', () => {
    it('should handle empty resenhas list', async () => {
      const bookId = 'book-with-no-resenhas';
      mockResenhasService.getResenhasByBook.mockResolvedValue([]);

      const result = await controller.getResenhasByBook(bookId);

      expect(result).toEqual([]);
      expect(service.getResenhasByBook).toHaveBeenCalledWith(bookId);
    });

    it('should handle different user IDs', async () => {
      const differentUser: CurrentUserDto = {
        userId: 'different-user-456',
        email: 'other@example.com',
        username: 'Different User',
        avatarUrl: '',
        pronouns: 'they/them',
      };
      const resenhaId = 'resenha-123';
      mockResenhasService.updateResenha.mockResolvedValue(mockResenha);

      await controller.updateResenha(
        differentUser,
        resenhaId,
        mockUpdateResenhaDto,
      );

      expect(service.updateResenha).toHaveBeenCalledWith(
        'different-user-456',
        resenhaId,
        mockUpdateResenhaDto,
      );
    });

    it('should handle empty update DTO', async () => {
      const resenhaId = 'resenha-123';
      const emptyUpdateDto: UpdateResenhaDto = {};
      mockResenhasService.updateResenha.mockResolvedValue(mockResenha);

      const result = await controller.updateResenha(
        mockCurrentUser,
        resenhaId,
        emptyUpdateDto,
      );

      expect(result).toEqual(mockResenha);
      expect(service.updateResenha).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        resenhaId,
        emptyUpdateDto,
      );
    });
  });
});