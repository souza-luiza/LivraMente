import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: 'user-id',
    username: 'Test User',
    email: 'test@test.com',
    senha: 'hashedpassword',
  };

  const mockSave = jest.fn().mockResolvedValue(mockUser);

  const mockUserModel = {
    // Métodos estáticos simulados do mongoose
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: Object.assign(
            jest.fn().mockImplementation(() => ({
              save: mockSave,
            })),
            mockUserModel
          ),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and save a user', async () => {
    const createUserDto = {
      username: 'Test',
      email: 'test@test.com',
      senha: '123456',
    };

    const result = await service.create(createUserDto);

    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should return all users', async () => {
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockUser]),
    });

    const result = await service.findAll();

    expect(mockUserModel.find).toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it('should return a user by id', async () => {
    mockUserModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    const result = await service.findOne('user-id');

    expect(mockUserModel.findById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException if no user is found by id', async () => {
    mockUserModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(service.findOne('no-existing-user')).rejects.toThrow(NotFoundException);
  });

  it('should return a user by email', async () => {
    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.getByEmail('test@test.com');

    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(result).toEqual(mockUser);
  });

  it('should return a user by username', async () => {
    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.getByUsername('Test');

    expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'Test' });
    expect(result).toEqual(mockUser);
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto = { username: 'Updated Name' };

      // Simula que não há usuário com esse username (evita conflito)
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateUserDto }),
        }),
      });

      const result = await service.update('user-id', updateUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: updateUserDto.username });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $set: updateUserDto },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it('should throw ConflictException if email is in use by another user', async () => {
      const updateUserDto = { email: 'test@test.com' };

      const otherUser = {
        ...mockUser,
        _id: {
          toString: () => 'different-id',
        },
      } as any;

      jest.spyOn(service, 'getByEmail').mockResolvedValueOnce(otherUser);

      await expect(service.update('user-id', updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if email is in use by the same user', async () => {
      const updateUserDto = { email: 'test@test.com' };

      const sameUser = {
        ...mockUser,
        _id: {
          toString: () => 'user-id',
        },
      } as any;

      jest.spyOn(service, 'getByEmail').mockResolvedValueOnce(sameUser);

      await expect(service.update('user-id', updateUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if username is in use by another user', async () => {
      const updateUserDto = { username: 'Test User' };

      const otherUser = {
        ...mockUser,
        _id: {
          toString: () => 'different-id',
        },
      } as any;

      jest.spyOn(service, 'getByUsername').mockResolvedValueOnce(otherUser);

      await expect(service.update('user-id', updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if username is in use by the same user', async () => {
      const updateUserDto = { username: 'Test User' };

      const sameUser = {
        ...mockUser,
        _id: {
          toString: () => 'user-id',
        },
      } as any;

      jest.spyOn(service, 'getByUsername').mockResolvedValueOnce(sameUser);

      await expect(service.update('user-id', updateUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found during update', async () => {
      const updateUserDto = { username: 'anyusername' };

      // Simula que não existe usuário com o username novo
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Simula que findByIdAndUpdate não encontrou o usuário para atualizar
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.update('no-existing-id', updateUserDto)).rejects.toThrow(NotFoundException);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: updateUserDto.username });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: 'no-existing-id' },
        { $set: updateUserDto },
        { new: true, runValidators: true },
      );
    });

  });

  it('should delete a user', async () => {
    mockUserModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    const result = await service.remove('user-id');

    expect(mockUserModel.deleteOne).toHaveBeenCalledWith({ _id: 'user-id' });
    expect(result).toEqual({ deletedCount: 1 });
  });
});