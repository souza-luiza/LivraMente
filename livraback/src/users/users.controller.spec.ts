import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    _id: 'user-id',
    username: 'Test User',
    email: 'test@test.com',
    senha: 'hashedpassword',
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        username: 'Test User',
        email: 'test@test.com',
        senha: '123456',
      };

      const result = await controller.create(dto);
      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const result = await controller.findOne('user-id');
      expect(usersService.findOne).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = { username: 'Updated' };
      const result = await controller.update('user-id', dto);
      expect(usersService.update).toHaveBeenCalledWith('user-id', dto);
      expect(result).toEqual({ ...mockUser, name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const result = await controller.remove('user-id');
      expect(usersService.remove).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ deletedCount: 1 });
    });
  });
});