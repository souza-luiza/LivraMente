import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

// Mock do AuthService
const mockAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  getSessionInfo: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('deve cadastrar um novo usuário e criar sessão', async () => {
      const createUserDto: CreateUserDto = { username: 'testuser', email: 'test@test.com', senha: 'test123' };
      const mockSession = {};

      mockAuthService.signUp.mockResolvedValue({ user: createUserDto });

      const result = await authController.signUp(createUserDto, mockSession as any);

      expect(result).toEqual({ user: createUserDto });
      expect(mockAuthService.signUp).toHaveBeenCalledWith(createUserDto, mockSession);
    });

    it('deve lançar erro se o email ou nome de usuário já existir', async () => {
      const createUserDto: CreateUserDto = { username: 'testuser', email: 'test@test.com', senha: 'test123' };
      const mockSession = {};

      mockAuthService.signUp.mockRejectedValue(new Error('E-mail ou nome de usuário já em uso'));

      try {
        await authController.signUp(createUserDto, mockSession as any);
      } catch (e) {
        expect(e.message).toBe('E-mail ou nome de usuário já em uso');
      }
    });
  });

  describe('signIn', () => {
    it('deve fazer login de um usuário com credenciais válidas', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', senha: 'test123' };
      const mockSession = {};

      mockAuthService.signIn.mockResolvedValue({ user: loginDto });

      const result = await authController.signIn(loginDto, mockSession as any);

      expect(result).toEqual({ user: loginDto });
      expect(mockAuthService.signIn).toHaveBeenCalledWith(loginDto, mockSession);
    });

    it('deve lançar erro de credenciais inválidas', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', senha: 'wrongpassword' };
      const mockSession = {};

      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException('Credenciais inválidas'));

      try {
        await authController.signIn(loginDto, mockSession as any);
      } catch (e) {
        expect(e.message).toBe('Credenciais inválidas');
      }
    });
  });

  describe('getSessionInfo', () => {
    it('deve retornar as informações do usuário autenticado', async () => {
      const mockSession = { user: { username: 'testuser', email: 'test@test.com', id: 1 } };

      const result = await authController.getSessionInfo(mockSession as any);

      expect(result).toEqual(mockSession.user);
    });

    it('deve lançar erro se a sessão for inválida', async () => {
      const mockSession = {};

      try {
        await authController.getSessionInfo(mockSession as any);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Sessão inválida');
      }
    });
  });

  describe('logout', () => {
    it('deve fazer logout e destruir a sessão com sucesso', async () => {
      // Mock da requisição
      const mockReq = { 
        session: { 
          destroy: jest.fn((callback) => callback(null))
        } 
      };

      // Mock da resposta
      const mockRes = { 
        clearCookie: jest.fn(),  
        json: jest.fn()  
      };

      await authController.logout(mockReq as any, mockRes as any);

      expect(mockReq.session.destroy).toHaveBeenCalled();

      expect(mockRes.clearCookie).toHaveBeenCalledWith('sessionId');

      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logout realizado com sucesso' });
    });

    it('deve retornar erro se falhar ao destruir a sessão', async () => {
      // Mock da requisição com erro no destroy
      const mockReq = { 
        session: { 
          destroy: jest.fn((callback) => callback(new Error('Erro ao deslogar'))) 
        } 
      };

      // Mock da resposta
      const mockRes = { 
        clearCookie: jest.fn(),
        status: jest.fn(() => mockRes),
        json: jest.fn()
      };

      await authController.logout(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro ao deslogar' });
    });
  });

});