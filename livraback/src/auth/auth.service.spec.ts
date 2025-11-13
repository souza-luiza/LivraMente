import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { scryptSync } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;

  // Mocks simples dos serviços que o AuthService usa
  const mockUsersService = {
    getByEmail: jest.fn(),
    getByUsername: jest.fn(),
    create: jest.fn(),
  };

  // Mock da sessão
  type MockSession = Record<string, any> & { user?: { id: string; username: string; email: string; avatarUrl?: string } };
  const mockSession: MockSession = {};

  // Limpa mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
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
        username: 'oi',
        email: 'teste@test.com',
        senha: '123456',
      }, mockSession),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error when username is in use', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null); // não existe usuário com email
    mockUsersService.getByUsername.mockResolvedValue({ id: '456', username: 'oi' }); // Username já está em uso

    await expect(
      service.signUp({
        username: 'oi',
        email: 'teste@test.com',
        senha: '123456',
      }, mockSession),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create user and save to session', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null); // não existe usuário com email
    mockUsersService.getByUsername.mockResolvedValue(null); // não existe usuário com username
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
    }, mockSession);

    expect(result).toEqual({
      id: 'user-id',
      username: 'teste',
      email: 'teste@test.com',
      avatarUrl: undefined, 
    });

    expect(mockSession.user).toEqual({
      id: 'user-id',
      username: 'teste',
      email: 'teste@test.com',
      avatarUrl: undefined,
    });
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
      senha: storedPassword,
    });

    await expect(
      service.signIn({ email: 'teste@test.com', senha: wrongPassword }, mockSession),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return user data and save to session if credentials are valid', async () => {
    const senha = '123456';
    const salt = 'saltteste';
    const hash = scryptSync(senha, salt, 32).toString('hex');
    const storedPassword = `${salt}.${hash}`;

    // Mock correto para o usuário retornado pelo 'getByEmail'
    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      username: 'teste',
      avatarUrl: 'mock.com/avatar.jpg',
      senha: storedPassword,
    });

    const result = await service.signIn({ email: 'teste@test.com', senha }, mockSession);

    expect(result).toEqual({
      id: 'user-id',
      username: 'teste',
      email: 'teste@test.com',
      avatarUrl: 'mock.com/avatar.jpg', 
    });
    
    expect(mockSession.user).toEqual({
      id: 'user-id',
      username: 'teste',
      email: 'teste@test.com',
      avatarUrl: 'mock.com/avatar.jpg',
    });
  });

  it('should throw UnauthorizedException if user not found on signIn', async () => {
    mockUsersService.getByEmail.mockResolvedValue(null);

    await expect(
      service.signIn({ email: 'naoexiste@teste.com', senha: 'qualquer' }, mockSession),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if stored hash length differs from computed hash length', async () => {
    const senha = '123456';
    const salt = 'saltteste';
    const hash = scryptSync(senha, salt, 32).toString('hex');

    const malformedStoredHash = hash.slice(0, 60);
    const storedPassword = `${salt}.${malformedStoredHash}`;

    mockUsersService.getByEmail.mockResolvedValue({
      _id: 'user-id',
      email: 'teste@test.com',
      senha: storedPassword,
    });

    await expect(
      service.signIn({ email: 'teste@test.com', senha }, mockSession),
    ).rejects.toThrow(UnauthorizedException);
  });
});