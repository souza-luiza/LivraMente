import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: 'user-id',
    email: 'test@test.com',
    name: 'Test User',
    password: 'hashedpassword',
  };

  const mockSave = jest.fn().mockResolvedValue(mockUser);

  const mockUserModel = {
    // Métodos estáticos
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
      email: 'test@test.com',
      name: 'Test',
      password: '123456',
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
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.findOne('user-id');

    expect(mockUserModel.findById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should return a user by email', async () => {
    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.getByEmail('test@test.com');

    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(result).toEqual(mockUser);
  });

  it('should update a user and return the updated user', async () => {
    const updateUserDto = { name: 'Updated Name' };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateUserDto }),
    });

    const result = await service.update('user-id', updateUserDto);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      { _id: 'user-id' },
      { $set: updateUserDto },
      { new: true, runValidators: true },
    );
    expect(result).toEqual({ ...mockUser, ...updateUserDto });
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
