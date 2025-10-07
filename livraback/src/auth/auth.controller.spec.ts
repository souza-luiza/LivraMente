import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock do AuthService
  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.signUp and return accessToken', async () => {
    const dto: CreateUserDto = {
      username: 'Teste',
      email: 'teste@teste.com',
      senha: '123456',
    };

    const mockToken = { accessToken: 'mock-token' };
    mockAuthService.signUp.mockResolvedValue(mockToken);
    const result = await controller.signUp(dto);

    expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockToken);
  });

  it('should call authService.signIn and return accessToken', async () => {
    const loginDto = {
      email: 'teste@teste.com',
      senha: '123456',
    };

    const mockToken = { accessToken: 'mock-token' };
    mockAuthService.signIn = jest.fn().mockResolvedValue(mockToken);

    const result = await controller.signIn(loginDto);

    expect(mockAuthService.signIn).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(mockToken);
  });
});
