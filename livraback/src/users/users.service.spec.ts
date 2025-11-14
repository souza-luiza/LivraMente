import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Readlist } from '../readlists/entities/readlist.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('UsersService', () => {
  let service: UsersService;
  let cloudinaryService: CloudinaryService;

  const mockCloudinaryService = {
    uploadImage: jest.fn().mockResolvedValue('mocked.com/fake.png'),
    deleteImage: jest.fn()
  };

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
    updateOne: jest.fn()
  };

  const mockReadlistModel = {
    findById: jest.fn(),
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
        {
          provide: getModelToken(Readlist.name),
          useValue: mockReadlistModel,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
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

      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateUserDto }),
        }),
      });
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      const result = await service.update('user-id', updateUserDto, mockSession as any);

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
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      jest.spyOn(service, 'getByEmail').mockResolvedValueOnce(otherUser);

      await expect(service.update('user-id', updateUserDto, mockSession as any)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username is in use by another user', async () => {
      const updateUserDto = { username: 'Test User' };

      const otherUser = {
        ...mockUser,
        _id: {
          toString: () => 'different-id',
        },
      } as any;
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      jest.spyOn(service, 'getByUsername').mockResolvedValueOnce(otherUser);

      await expect(service.update('user-id', updateUserDto, mockSession as any)).rejects.toThrow(ConflictException);
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
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      await expect(service.update('no-existing-id', updateUserDto, mockSession as any)).rejects.toThrow(NotFoundException);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: updateUserDto.username });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: 'no-existing-id' },
        { $set: updateUserDto },
        { new: true, runValidators: true },
      );
    });

  });

  describe('registroLeitura', () => {
    const mockGamificacao = {
      nivel: 1,
      XP: 0,
      XP_proximo_nivel: 100,
    };

    const baseUserWithGamification = {
      ...mockUser,
      gamificação: { ...mockGamificacao },
    };

    it('deve ganhar XP por páginas lidas, limitado a 60', async () => {
      const userMock = {
        ...baseUserWithGamification,
        gamificação: { ...mockGamificacao },
      };

      // Mock do findOne usado dentro de registroLeitura
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 100); // 100 páginas -> 100 XP, mas limitado a 60

      expect(result).toEqual({ ganhoXP: 60 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $set: { gamificação: expect.any(Object) } },
      );
    });

    it('deve ganhar XP por minutos lidos, limitado a 60', async () => {
      const userMock = {
        ...baseUserWithGamification,
        gamificação: { ...mockGamificacao },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 1, 200); // 200 minutos -> 100 XP -> limitado a 60

      expect(result).toEqual({ ganhoXP: 60 });
    });

    it('deve subir de nível corretamente com XP suficiente', async () => {
      const userMock = {
        ...baseUserWithGamification,
        gamificação: {
          nivel: 1,
          XP: 90,
          XP_proximo_nivel: 100,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 20); // +20 XP => total 110 => sobe 1 nível

      expect(result).toEqual({ ganhoXP: 20 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 2,
              XP: 10, // 110 - 100
              XP_proximo_nivel: 200, // nível < 5 => +100
            },
          },
        },
      );
    });

    it('deve inicializar gamificação se não existir', async () => {
      const userMock = {
        ...mockUser,
        gamificação: undefined,
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 10); // +10 XP

      expect(result).toEqual({ ganhoXP: 10 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 1,
              XP: 10,
              XP_proximo_nivel: 100,
            },
          },
        },
      );
    });

    it('deve subir múltiplos níveis se XP for suficiente', async () => {
      const userMock = {
        ...mockUser,
        gamificação: {
          nivel: 1,
          XP: 95,
          XP_proximo_nivel: 100,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 300); // 300 XP => limitado a 60 => total 155

      // Sobe para nível 2 (100), sobra 55 XP
      // XP_proximo_nivel vira 200

      expect(result).toEqual({ ganhoXP: 60 });

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 2,
              XP: 55,
              XP_proximo_nivel: 200,
            },
          },
        },
      );
    });

    it('deve aumentar XP_proximo_nivel em 150 se nível entre 5 e 8', async () => {
      const userMock = {
        ...mockUser,
        gamificação: {
          nivel: 5,
          XP: 490,
          XP_proximo_nivel: 550,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 100); // ganhoXP = 60

      expect(result).toEqual({ ganhoXP: 60 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 6,
              XP: 0,
              XP_proximo_nivel: 700, // 550 + 150
            },
          },
        }
      );
    });

    it('deve aumentar XP_proximo_nivel em 200 se nível entre 9 e 12', async () => {
      const userMock = {
        ...mockUser,
        gamificação: {
          nivel: 9,
          XP: 1140,
          XP_proximo_nivel: 1200,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 200); // ganhoXP = 60

      expect(result).toEqual({ ganhoXP: 60 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 10,
              XP: 0,
              XP_proximo_nivel: 1400, // 1200 + 200
            },
          },
        }
      );
    });

    it('deve aumentar XP_proximo_nivel em 250 se nível >= 13', async () => {
      const userMock = {
        ...mockUser,
        gamificação: {
          nivel: 13,
          XP: 1990,
          XP_proximo_nivel: 2050,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock as any);
      mockUserModel.updateOne.mockResolvedValueOnce({});

      const result = await service.registroLeitura('user-id', 0, 100); // ganhoXP = 60

      expect(result).toEqual({ ganhoXP: 60 });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        {
          $set: {
            gamificação: {
              nivel: 14,
              XP: 0, 
              XP_proximo_nivel: 2300, 
            },
          },
        }
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

  describe('favoritarReadlist', () => {
    it('deve favoritar uma readlist pública de outro usuário', async () => {
      const readlist = {
        _id: 'readlist-id',
        criador: 'outro-user-id',
        publica: true,
      };

      const user = {
        _id: 'user-id',
        readlists_favoritas: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      mockReadlistModel.findById.mockResolvedValue(readlist);
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.favoritarReadlist('user-id', 'readlist-id');

      expect(result).toEqual({ message: 'Readlist favoritada com sucesso' });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $addToSet: { readlists_favoritas: 'readlist-id' } }
      );
    });

    it('deve lançar erro se readlist não existir', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ _id: 'user-id', readlists_favoritas: [] } as any);
      mockReadlistModel.findById.mockResolvedValue(null);

      await expect(service.favoritarReadlist('user-id', 'readlist-id'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('deve lançar erro se readlist for do próprio usuário', async () => {
      const readlist = {
        _id: 'readlist-id',
        criador: 'user-id',
        publica: true,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({ _id: 'user-id', readlists_favoritas: [] } as any);
      mockReadlistModel.findById.mockResolvedValue(readlist);

      await expect(service.favoritarReadlist('user-id', 'readlist-id'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('deve lançar erro se readlist não for pública', async () => {
      const readlist = {
        _id: 'readlist-id',
        criador: 'outro-user-id',
        publica: false,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({ _id: 'user-id', readlists_favoritas: [] } as any);
      mockReadlistModel.findById.mockResolvedValue(readlist);

      await expect(service.favoritarReadlist('user-id', 'readlist-id'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('deve lançar erro se readlist já estiver favoritada', async () => {
      const readlist = {
        _id: 'readlist-id',
        criador: 'outro-user-id',
        publica: true,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({
        _id: 'user-id',
        readlists_favoritas: ['readlist-id'],
      } as any);

      mockReadlistModel.findById.mockResolvedValue(readlist);

      await expect(service.favoritarReadlist('user-id', 'readlist-id'))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('desfavoritarReadlist', () => {
    it('deve remover readlist dos favoritos', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.desfavoritarReadlist('user-id', 'readlist-id');

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $pull: { readlists_favoritas: 'readlist-id' } }
      );

      expect(result).toEqual({ message: 'Readlist removida dos favoritos com sucesso' });
    });
  });

  describe('findReadlistsFavoritas', () => {
    it('deve retornar readlists favoritas do usuário', async () => {
      const userWithPopulatedReadlists = {
        _id: 'user-id',
        readlists_favoritas: ['readlist1', 'readlist2'],
      };

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userWithPopulatedReadlists),
      });

      const result = await service.findReadlistsFavoritas('user-id');

      expect(result).toEqual(['readlist1', 'readlist2']);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findReadlistsFavoritas('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvatar', () => {
    const file: Express.Multer.File = {fieldname: 'avatar',
      originalname: 'teste.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('fakeimage'),
      size: 1234,
      stream: null as any,
      destination: '',
      filename: '',
      path: ''
    };
    const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateAvatar('user-id', file, mockSession as any)).rejects.toThrow(NotFoundException);
    })

    it('deve lançar erro se o arquivo for inválido', async () => {
      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.updateAvatar('1', {} as any, mockSession as any)).rejects.toThrow(BadRequestException);
    })

    it('deve fazer upload e atualizar avatar corretamente', async () => {
      const mockUser = {
        avatarPublicId: 'old_public_id',
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({ username: 'john', senha: '123' }),
      };

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.updateAvatar('1', file, mockSession as any);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        file.buffer,
        'livra/avatars',
      );
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('old_public_id');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ username: 'john' });
    });
  })
});