import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('ReadlistsService', () => {
  let service: ReadlistsService;

  const mockReadlist = { _id: '1', nome: 'Minha Readlist', criador: 'user123', slug: 'minha-readlist' };
  const publicReadlist = { _id: '1', nome: 'Readlist Pública', publica: true };

  const mockSave = jest.fn().mockResolvedValue(mockReadlist);

  const mockReadlistModel = {
    prototype: {
      save: mockSave,
    },
    find: jest.fn().mockImplementation((filter) => ({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockReadlist]),
    })),
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

  const mockPopulate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ readlists: [publicReadlist] }),
  });

  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn().mockReturnValue({ populate: mockPopulate }),
  };

  const mockUsersService = {
    getByUsername: jest.fn().mockResolvedValue({ _id: 'user123', username: 'user123' }),
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
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ReadlistsService>(ReadlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a readlist with unique slug and link to user', async () => {
      const createDto: CreateReadlistDto = { nome: 'Minha Readlist' };
      const mockExists = jest.fn().mockResolvedValue(null);
      const mockSavedReadlist = {
        _id: 'readlist123',
        nome: 'Minha Readlist',
        slug: 'minha-readlist',
        criador: 'user123',
      };
      const mockSave = jest.fn().mockResolvedValue(mockSavedReadlist);
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      mockConstructor.exists = mockExists;

      mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      const service = new ReadlistsService(
        mockConstructor as any,
        mockUserModel as any,
        mockUsersService as any,
      );

      const result = await service.create('user123', createDto);

      expect(mockExists).toHaveBeenCalledWith({
        slug: 'minha-readlist',
        criador: 'user123',
      });

      expect(mockConstructor).toHaveBeenCalledWith({
        nome: 'Minha Readlist',
        criador: 'user123',
        slug: 'minha-readlist',
      });

      expect(mockSave).toHaveBeenCalled();

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $push: { readlists: 'readlist123' } },
        { new: true },
      );

      expect(result).toEqual(mockSavedReadlist);
    });
  });

  describe('findAll', () => {
    it('should return all readlists for user', async () => {
      mockReadlistModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockReadlist]),
      }),
    });

      const result = await service.findAll('user123');
      expect(mockReadlistModel.find).toHaveBeenCalledWith({ criador: 'user123' });
      expect(result).toEqual([mockReadlist]);
    });
  });

  describe('findOne', () => {
    it('should return one readlist by slug and user', async () => {
      const result = await service.findOne('user123', 'minha-readlist');
      expect(mockReadlistModel.findOne).toHaveBeenCalledWith({ slug: 'minha-readlist', criador: 'user123' });
      expect(result).toEqual(mockReadlist);
    });

    it('should throw NotFoundException if not found', async () => {
      mockReadlistModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('user123', '1')).rejects.toThrow(NotFoundException);
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
  });

  describe('remove', () => {
    it('should remove readlist and update user', async () => {
      mockReadlistModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockReadlist),
      });

      mockReadlistModel.deleteOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      const result = await service.remove('user123', 'minha-readlist');
      expect(mockReadlistModel.findOne).toHaveBeenCalledWith({ slug: 'minha-readlist', criador: 'user123' });
      expect(mockReadlistModel.deleteOne).toHaveBeenCalledWith({ _id: '1' });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', { $pull: { readlists: '1' } });
      expect(result).toEqual({ deleted: true, slug: 'minha-readlist' });
    });

    it('should throw NotFoundException if readlist not found', async () => {
      mockReadlistModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove('user123', 'nao-existe')).rejects.toThrow(NotFoundException);
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

    it('should throw NotFoundException if readlist not found', async () => {
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addLivro('user123', '1', 'livro123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on CastError', async () => {
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      });

      await expect(service.addLivro('user123', 'invalid', 'livro123')).rejects.toThrow(BadRequestException);
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

    it('should throw NotFoundException if readlist not found', async () => {
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.removeLivro('user123', '1', 'livro123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on CastError', async () => {
      mockReadlistModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      });

      await expect(service.removeLivro('user123', 'invalid', 'livro123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllPublic', () => {
    it('should return all public readlists for a user', async () => {
      const result = await service.findAllPublic('user123');

      expect(mockUsersService.getByUsername).toHaveBeenCalledWith('user123');
      expect(mockPopulate).toHaveBeenCalledWith({
        path: 'readlists',
        match: { publica: true },
        select: '-favorito -capa_public_id',
      });
      expect(result).toEqual([publicReadlist]);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.getByUsername.mockResolvedValueOnce(null);
      await expect(service.findAllPublic('user123')).rejects.toThrow(NotFoundException);
    });
  });
});