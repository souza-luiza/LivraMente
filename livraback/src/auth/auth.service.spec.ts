import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

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
});
