import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ComunidadesController } from './comunidades.controller';
import { ComunidadesService } from './comunidades.service';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';

describe('ComunidadesController', () => {
  let controller: ComunidadesController;
  let service: ComunidadesService;

  const mockComunidadesService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllPosts: jest.fn(),
    findAllComunidadeMembros: jest.fn(),
    findAllComunidadeModeradores: jest.fn(),
    verifyMemberOrMod: jest.fn(),
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

  describe('findAll', () => {
    it('deve retornar todas as comunidades com sucesso', async () => {
      const mockComunidades = [
        { _id: '1', nome: 'Livros', moderadores: ['user1'], membros: ['user1'] },
        { _id: '2', nome: 'Música', moderadores: ['user2'], membros: ['user2'] }
      ];

      mockComunidadesService.findAll.mockResolvedValue(mockComunidades);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockComunidades); 
    });

    it('deve propagar erro quando service falhar', async () => {
      mockComunidadesService.findAll.mockRejectedValue(new Error('Erro no banco de dados'));

      await expect(controller.findAll()).rejects.toThrow('Erro no banco de dados');
    });
  });

  describe('create', () => {
    it('deve criar uma comunidade com sucesso', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const createDto: CreateComunidadeDto = { nome: 'livros' };
      const mockResponse = { _id: '1', nome: 'livros' };

      mockComunidadesService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith('123', createDto);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar ConflictException quando nome já existir', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const createDto: CreateComunidadeDto = { nome: 'livros' };

      mockComunidadesService.create.mockRejectedValue(new ConflictException('Nome de comunidade em uso'));

      await expect(controller.create(mockUser, createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma comunidade com sucesso', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };
      const mockResponse = { _id: '1', nome: 'nova-livros' };

      mockComunidadesService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(mockUser, 'livros', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', 'livros', updateDto);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };

      mockComunidadesService.update.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.update(mockUser, 'inexistente', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('deve propagar UnauthorizedException quando usuário não for moderador', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };

      mockComunidadesService.update.mockRejectedValue(new UnauthorizedException('Apenas o moderador pode editar a comunidade'));

      await expect(controller.update(mockUser, 'fantasia', updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve propagar ConflictException quando novo nome já existir', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com' };
      const updateDto: UpdateComunidadeDto = { nome: 'nome-existente' };

      mockComunidadesService.update.mockRejectedValue(new ConflictException('Nome de comunidade em uso'));

      await expect(controller.update(mockUser, 'fantasia', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllPosts', () => {
    it('deve retornar posts da comunidade', async () => {
      const mockPosts = ['post1', 'post2'];
      mockComunidadesService.findAllPosts.mockResolvedValue(mockPosts);
  
      const result = await controller.findAllPosts('fantasia');
  
      expect(service.findAllPosts).toHaveBeenCalledWith('fantasia');
      expect(result).toEqual(mockPosts);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.findAllPosts.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.findAllPosts('inexistente')).rejects.toThrow(NotFoundException);
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

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.findAllComunidadeMembros.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.findAllComunidadeMembros('inexistente')).rejects.toThrow(NotFoundException);
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

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};

      mockComunidadesService.addMembro.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.addMembro(mockUser, 'inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException quando ID for inválido', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};

      mockComunidadesService.addMembro.mockRejectedValue(new BadRequestException('ID inválido'));

      await expect(controller.addMembro(mockUser, 'fantasia')).rejects.toThrow(BadRequestException);
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

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};

      mockComunidadesService.removeMembro.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.removeMembro(mockUser, 'inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException quando for único moderador', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};

      mockComunidadesService.removeMembro.mockRejectedValue(new BadRequestException('Não é possível remover o único moderador da comunidade'));

      await expect(controller.removeMembro(mockUser, 'fantasia')).rejects.toThrow(BadRequestException);
    });

    it('deve propagar BadRequestException quando ID for inválido', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'a@a.com'};

      mockComunidadesService.removeMembro.mockRejectedValue(new BadRequestException('ID inválido'));

      await expect(controller.removeMembro(mockUser, 'fantasia')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma comunidade específica pelo nome com sucesso', async () => {
      const mockComunidade = { 
        _id: '1', 
        nome: 'fantasia', 
        descricao: 'Comunidade sobre livros de fantasia',
        moderadores: ['user1'], 
        membros: ['user1', 'user2'] 
      };

      mockComunidadesService.findOne.mockResolvedValue(mockComunidade);

      const result = await controller.findOne('fantasia');

      expect(service.findOne).toHaveBeenCalledWith('fantasia');
      expect(result).toEqual(mockComunidade);
    });

    it('deve lançar erro quando comunidade não for encontrada', async () => {
      mockComunidadesService.findOne.mockRejectedValue(new Error('Comunidade não encontrada'));

      await expect(controller.findOne('comunidade-inexistente')).rejects.toThrow('Comunidade não encontrada');
      expect(service.findOne).toHaveBeenCalledWith('comunidade-inexistente');
    });
  });

  describe('findAllComunidadeModeradores', () => {
    it('deve retornar moderadores da comunidade com sucesso', async () => {
      const mockModeradores = [
        { _id: '1', username: 'mod1', email: 'mod1@email.com' },
        { _id: '2', username: 'mod2', email: 'mod2@email.com' }
      ];

      mockComunidadesService.findAllComunidadeModeradores.mockResolvedValue(mockModeradores);

      const result = await controller.findAllComunidadeModeradores('fantasia');

      expect(service.findAllComunidadeModeradores).toHaveBeenCalledWith('fantasia');
      expect(result).toEqual(mockModeradores);
    });

    it('deve retornar array vazio quando não houver moderadores', async () => {
      mockComunidadesService.findAllComunidadeModeradores.mockResolvedValue([]);

      const result = await controller.findAllComunidadeModeradores('comunidade-nova');

      expect(service.findAllComunidadeModeradores).toHaveBeenCalledWith('comunidade-nova');
      expect(result).toEqual([]);
    });

    it('deve lançar erro quando comunidade não for encontrada', async () => {
      mockComunidadesService.findAllComunidadeModeradores.mockRejectedValue(new Error('Comunidade não encontrada'));

      await expect(controller.findAllComunidadeModeradores('comunidade-inexistente')).rejects.toThrow('Comunidade não encontrada');
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.findAllComunidadeModeradores.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.findAllComunidadeModeradores('comunidade-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verificarMembro', () => {
    it('deve verificar que usuário é membro mas não moderador', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'membro@email.com' };
      const mockResponse = { 
        isMember: true, 
        isModerador: false 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(true);
      expect(result.isModerador).toBe(false);
    });

    it('deve verificar que usuário é moderador', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'moderador@email.com' };
      const mockResponse = { 
        isMember: true, 
        isModerador: true 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(true);
      expect(result.isModerador).toBe(true);
    });

    it('deve verificar que usuário não é membro nem moderador', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'nao-membro@email.com' };
      const mockResponse = { 
        isMember: false, 
        isModerador: false 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(false);
      expect(result.isModerador).toBe(false);
    });

    it('deve lançar erro quando comunidade não for encontrada', async () => {
      const mockUser: CurrentUserDto = { userId: '123', email: 'user@email.com' };
      
      mockComunidadesService.verifyMemberOrMod.mockRejectedValue(new Error('Comunidade não encontrada'));

      await expect(controller.verificarMembro('comunidade-inexistente', mockUser)).rejects.toThrow('Comunidade não encontrada');
      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'comunidade-inexistente');
    });

    it('deve propagar UnauthorizedException quando userId for vazio', async () => {
      const mockUser: CurrentUserDto = { userId: '', email: 'user@email.com' };
      
      mockComunidadesService.verifyMemberOrMod.mockRejectedValue(new UnauthorizedException('Usuário não autenticado'));

      await expect(controller.verificarMembro('fantasia', mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });
});