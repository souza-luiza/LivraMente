import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
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
    findOneUser: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, username: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    registroLeitura: jest.fn().mockResolvedValue({ ganhoXP: 30 }),
    favoritarReadlist: jest.fn().mockResolvedValue({ message: 'Readlist favoritada com sucesso' }),
    desfavoritarReadlist: jest.fn().mockResolvedValue({ message: 'Readlist removida dos favoritos com sucesso' }),
    findReadlistsFavoritas: jest.fn().mockResolvedValue([
      { _id: 'r1', nome: 'Readlist 1' },
      { _id: 'r2', nome: 'Readlist 2' },
    ]),
    getPublicByUsername: jest.fn().mockResolvedValue(mockUser),
    updateAvatar: jest.fn().mockResolvedValue({ avatarUrl: 'mocked.com/test.png' })
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

  describe('getProfile', () => {
    it('should return a user profile', async () => {
      const username = 'username-test' 

      const result = await controller.getProfile(username);

      expect(usersService.findOneUser).toHaveBeenCalledWith(username);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update the current user profile', async () => {
      const currentUser = { userId: 'user-id', email: 'test@test.com' }; // simula o CurrentUserDto
      const updateUserDto: UpdateUserDto = { username: 'Updated' };
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      const result = await controller.updateProfile(currentUser, updateUserDto, mockSession as any);

      expect(usersService.update).toHaveBeenCalledWith(currentUser.userId, updateUserDto, mockSession as any);
      expect(result).toEqual({ ...mockUser, username: 'Updated' });
    });
  });

  describe('registroLeitura', () => {
    it('should register reading and return XP gained', async () => {
      const currentUser = { userId: 'user-id', email: 'test@test.com' };
      const dto = { opcao: 0, qtd: 30 }; // ex: 30 páginas -> 30 XP

      const result = await controller.registroLeitura(currentUser, dto);

      expect(usersService.registroLeitura).toHaveBeenCalledWith(currentUser.userId, dto.opcao, dto.qtd);
      expect(result).toEqual({ ganhoXP: 30 });
    });

    it('should register reading by minutes and return XP gained (limited to 60)', async () => {
      mockUsersService.registroLeitura.mockResolvedValueOnce({ ganhoXP: 25 }); // 50 minutos = 25 XP

      const currentUser = { userId: 'user-id', email: 'test@test.com' };
      const dto = { opcao: 1, qtd: 50 };

      const result = await controller.registroLeitura(currentUser, dto);

      expect(usersService.registroLeitura).toHaveBeenCalledWith(currentUser.userId, dto.opcao, dto.qtd);
      expect(result).toEqual({ ganhoXP: 25 });
    });
  });

  describe('favoritarReadlist', () => {
    it('deve favoritar uma readlist', async () => {
      const currentUser = { userId: 'user-id', email: 'test@test.com' };
      const readlistId = 'readlist-id';

      mockUsersService.favoritarReadlist = jest.fn().mockResolvedValue({
        message: 'Readlist favoritada com sucesso',
      });

      const result = await controller.favoritarReadlist(currentUser, readlistId);

      expect(usersService.favoritarReadlist).toHaveBeenCalledWith(currentUser.userId, readlistId);
      expect(result).toEqual({ message: 'Readlist favoritada com sucesso' });
    });
  });

  describe('desfavoritarReadlist', () => {
    it('deve desfavoritar uma readlist', async () => {
      const currentUser = { userId: 'user-id', email: 'test@test.com' };
      const readlistId = 'readlist-id';

      mockUsersService.desfavoritarReadlist = jest.fn().mockResolvedValue({
        message: 'Readlist removida dos favoritos com sucesso',
      });

      const result = await controller.desfavoritarReadlist(currentUser, readlistId);

      expect(usersService.desfavoritarReadlist).toHaveBeenCalledWith(currentUser.userId, readlistId);
      expect(result).toEqual({ message: 'Readlist removida dos favoritos com sucesso' });
    });
  });

  describe('findReadlistsFavoritas', () => {
    it('deve retornar as readlists favoritas do usuário', async () => {
      const currentUser = { userId: 'user-id', email: 'test@test.com' };

      const mockReadlists = [
        { _id: 'r1', nome: 'Readlist 1' },
        { _id: 'r2', nome: 'Readlist 2' },
      ];

      mockUsersService.findReadlistsFavoritas = jest.fn().mockResolvedValue(mockReadlists);

      const result = await controller.findReadlistsFavoritas(currentUser);

      expect(usersService.findReadlistsFavoritas).toHaveBeenCalledWith(currentUser.userId);
      expect(result).toEqual(mockReadlists);
    });
  });

  describe('updateAvatar', () => {
    const fakeUser = { userId: 'user-id' };

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'avatar.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image'),
      size: 1234,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve lançar BadRequestException se nenhum arquivo for enviado', async () => {
      await expect(controller.updateAvatar(fakeUser as any, undefined as any)).rejects.toThrow(
        'Nenhum arquivo foi enviado'
      );
    });

    it('deve chamar o service e retornar o resultado', async () => {
      const mockResponse = { avatarUrl: 'mocked.com/teste.png' };
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };
      mockUsersService.updateAvatar = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.updateAvatar(fakeUser as any, fakeFile, mockSession as any);

      expect(usersService.updateAvatar).toHaveBeenCalledWith(fakeUser.userId, fakeFile, mockSession as any);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar erro do service', async () => {
      mockUsersService.updateAvatar = jest.fn().mockRejectedValue(new Error('Erro interno'));
      await expect(controller.updateAvatar(fakeUser as any, fakeFile)).rejects.toThrow('Erro interno');
    });
  });
});