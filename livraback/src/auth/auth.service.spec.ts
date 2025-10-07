import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { scryptSync } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;

  // Mocks simples dos serviços que o AuthService usa
  const mockUsersService = {
    getByEmail: jest.fn(),
    getByUsername: jest.fn(),
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

  it('should throw BadRequestException when email is in use', async () => {
    mockUsersService.getByEmail.mockResolvedValue({ id: '123', email: 'teste@test.com' });

    await expect(
      service.signUp({
        username: "oi",
        email: "teste@test.com",
        senha: "123456",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error when username is in use', async () => {
    // Email está livre
    mockUsersService.getByEmail.mockResolvedValue(null);
    // Username já está em uso
    mockUsersService.getByUsername.mockResolvedValue({ id: '456', username: 'oi' });

    await expect(
      service.signUp({
        username: "oi",
        email: "teste@test.com",
        senha: "123456",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create user and return token', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null); // nao existe usuario com email
    mockUsersService.getByUsername.mockResolvedValue(null); // nao existe usuario com username
    mockUsersService.create.mockResolvedValue({
      _id: 'user-id',
      username: 'teste',
      email: 'teste@test.com',
      senha: 'hashed-password',
    });

    const result = await service.signUp({
      username: 'teste',
      email: 'teste@test.com',
      senha: '123456',
    });

    expect(result).toHaveProperty('accessToken');
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password is incorrect on signIn', async () => {
    const correctPassword = '123456';
    const wrongPassword = 'senhaerrada';
    const salt = 'saltteste';
    const correctHash = scryptSync(correctPassword, salt, 32).toString('hex');
    const storedPassword = `${salt}.${correctHash}`;

    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      password: storedPassword,
    });

    await expect(
      service.signIn({ email: 'teste@test.com', password: wrongPassword }),
    ).rejects.toThrow(UnauthorizedException);
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

  it('should throw UnauthorizedException if user not found on signIn', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null);

    await expect(
      service.signIn({ email: 'naoexiste@teste.com', password: 'qualquer' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if stored hash length differs from computed hash length', async () => {
    const password = '123456';
    const salt = 'saltteste';
    const hash = scryptSync(password, salt, 32).toString('hex');

    // Simula um hash malformado (ex: truncado)
    const malformedStoredHash = hash.slice(0, 60);
    const storedPassword = `${salt}.${malformedStoredHash}`;

    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      password: storedPassword,
    });

    await expect(
      service.signIn({ email: 'teste@test.com', password }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
