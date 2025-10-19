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
    updateOne: jest.fn()
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
});