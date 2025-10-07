import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { scryptSync } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;

  // Mocks simples dos serviços que o AuthService usa
  const mockUsersService = {
    getByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token-mock'),
  };

  // Limpa mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when email is in use', async () => {
    // Simula que o usuário já existe
    mockUsersService.getByEmail.mockResolvedValue({ id: '123', email: 'teste@test.com' }); // controla o que funcao ira retornar quando chamada

    await expect(
      service.signUp({
        email: "teste@test.com",
        name: "oi",
        password: "123456",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create user and return token', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null); // nao existe usuario com email
    mockUsersService.create.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      password: 'hashed-password',
      name: 'teste',
    });

    const result = await service.signUp({
      email: 'teste@test.com',
      name: 'teste',
      password: '123456',
    });

    expect(result).toHaveProperty('accessToken');
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('should throw error if password is incorrect on signIn', async () => {
    const fakePassword = '123456';
    const salt = 'saltteste';
    const fakeHash = scryptSync(fakePassword, salt, 32).toString('hex');
    const storedPassword = `${salt}.${fakeHash}`;

    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      password: storedPassword,
    });

    await expect(
      service.signIn({ email: 'teste@test.com', password: 'senhaerrada' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return accessToken if credentials are valid', async () => {
    const password = '123456';
    const salt = 'saltteste';
    const hash = scryptSync(password, salt, 32).toString('hex');
    const storedPassword = `${salt}.${hash}`;

    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      password: storedPassword,
    });

    const result = await service.signIn({ email: 'teste@test.com', password });

    expect(result).toHaveProperty('accessToken');
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('should throw BadRequestException if user not found on signIn', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null); // simula usuário não encontrado

    await expect(
      service.signIn({ email: 'naoexiste@teste.com', password: 'qualquer' }),
    ).rejects.toThrow(BadRequestException);
  });

});
