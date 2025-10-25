import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { CurrentUserDto } from '../auth/dto/current-user.dto';

describe('ComunidadesController', () => {
  let controller: ComunidadesController;
  let service: ComunidadesService;

  const mockComunidadesService = {
    findAllPosts: jest.fn(),
    findAllComunidadeMembros: jest.fn(),
    addMembro: jest.fn(),
    removeMembro: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadesController],
      providers: [
        {
          provide: ComunidadesService,
          useValue: mockComunidadesService,
        },
      ],
    }).compile();

    controller = module.get<ComunidadesController>(ComunidadesController);
    service = module.get<ComunidadesService>(ComunidadesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAllPosts', () => {
    it('deve retornar posts da comunidade', async () => {
      const mockPosts = ['post1', 'post2'];
      mockComunidadesService.findAllPosts.mockResolvedValue(mockPosts);
  
      const result = await controller.findAllPosts('fantasia');
  
      expect(service.findAllPosts).toHaveBeenCalledWith('fantasia');
      expect(result).toEqual(mockPosts);
    });
  });

  describe('findAllComunidadeMembros', () => {
    it('deve retornar membros da comunidade', async () => {
      const mockMembros = ['user1', 'user2'];
      mockComunidadesService.findAllComunidadeMembros.mockResolvedValue(mockMembros);
  
      const result = await controller.findAllComunidadeMembros('fantasia');
  
      expect(service.findAllComunidadeMembros).toHaveBeenCalledWith('fantasia');
      expect(result).toEqual(mockMembros);
    });
  });
  
  describe('addMembro', () => {
    it('deve adicionar membro com sucesso', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};
      const mockResponse = { message: 'Usuário adicionado à comunidade com sucesso' };
  
      mockComunidadesService.addMembro.mockResolvedValue(mockResponse);
  
      const result = await controller.addMembro(mockUser, 'fantasia');
  
      expect(service.addMembro).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeMembro', () => {
    it('deve remover membro com sucesso', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};
      const mockResponse = { message: 'Usuário removido da comunidade com sucesso' };
  
      mockComunidadesService.removeMembro.mockResolvedValue(mockResponse);
  
      const result = await controller.removeMembro(mockUser, 'fantasia');
  
      expect(service.removeMembro).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
    });
  });
});