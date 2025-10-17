import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReadlistsService', () => {
  let service: ReadlistsService;

  const mockReadlist = { _id: '1', nome: 'Minha Readlist', criador: 'user123' };

  const mockSave = jest.fn().mockResolvedValue(mockReadlist);

  const mockReadlistModel = {
    prototype: {
      save: mockSave,
    },
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockReadlist]),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReadlist),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockReadlist, nome: 'Atualizado' }),
    }),
    deleteOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }),
  };

  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadlistsService,
        {
          provide: getModelToken('Readlist'),
          useValue: mockReadlistModel,
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<ReadlistsService>(ReadlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a readlist', async () => {
      const createDto: CreateReadlistDto = { nome: 'Minha Readlist' };
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      const customService = new ReadlistsService(mockConstructor as any, mockUserModel as any);

      const result = await customService.create('user123', createDto);
      expect(mockSave).toHaveBeenCalled();
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $push: { readlists: mockReadlist._id } },
        { new: true }
      );
      expect(result).toEqual(mockReadlist);
    });
  });

  describe('findAll', () => {
    it('should return all readlists for user', async () => {
      const result = await service.findAll('user123');
      expect(mockReadlistModel.find).toHaveBeenCalledWith({ criador: 'user123' });
      expect(result).toEqual([mockReadlist]);
    });
  });

  describe('findOne', () => {
    it('should return one readlist by id and user', async () => {
      const result = await service.findOne('user123', '1');
      expect(mockReadlistModel.findOne).toHaveBeenCalledWith({ _id: '1', criador: 'user123' });
      expect(result).toEqual(mockReadlist);
    });

    it('should throw NotFoundException if not found', async () => {
      mockReadlistModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('user123', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on CastError', async () => {
      const castError = { name: 'CastError' };
      mockReadlistModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(castError),
      });

      await expect(service.findOne('user123', 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a readlist', async () => {
      const dto: UpdateReadlistDto = { nome: 'Atualizado' };
      const result = await service.update('user123', '1', dto);
      expect(result).toEqual({ ...mockReadlist, nome: 'Atualizado' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('user123', '1', { nome: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on CastError', async () => {
      const castError = { name: 'CastError' };
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(castError),
      });

      await expect(service.update('user123', 'invalid', { nome: 'x' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove readlist and update user', async () => {
      const result = await service.remove('user123', '1');
      expect(mockReadlistModel.deleteOne).toHaveBeenCalledWith({ _id: '1', criador: 'user123' });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', { $pull: { readlists: '1' } });
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('should throw NotFound if nothing deleted', async () => {
      mockReadlistModel.deleteOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.remove('user123', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest on CastError', async () => {
      mockReadlistModel.deleteOne.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      });

      await expect(service.remove('user123', 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addLivro', () => {
    it('should add a livro to the readlist', async () => {
      const result = await service.addLivro('user123', '1', 'livro123');
      expect(mockReadlistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', criador: 'user123' },
        { $addToSet: { livros: 'livro123' } },
        { new: true, runValidators: true }
      );
      expect(result).toEqual({ ...mockReadlist, nome: 'Atualizado' });
    });
  });

  describe('removeLivro', () => {
    it('should remove a livro from the readlist', async () => {
      const result = await service.removeLivro('user123', '1', 'livro123');
      expect(mockReadlistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', criador: 'user123' },
        { $pull: { livros: 'livro123' } },
        { new: true }
      );
      expect(result).toEqual({ ...mockReadlist, nome: 'Atualizado' });
    });
  });
});