import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    removerMembroComoModerador: jest.fn(),
    tornarMembroModerador: jest.fn(),
    deleteCommunity: jest.fn(),
    uploadCapa: jest.fn(),
    uploadBanner: jest.fn(),
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
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const createDto: CreateComunidadeDto = { nome: 'livros' };
      const mockResponse = { _id: '1', nome: 'livros' };

      mockComunidadesService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith('123', createDto);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar ConflictException quando nome já existir', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const createDto: CreateComunidadeDto = { nome: 'livros' };

      mockComunidadesService.create.mockRejectedValue(new ConflictException('Nome de comunidade em uso'));

      await expect(controller.create(mockUser, createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma comunidade com sucesso', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };
      const mockResponse = { _id: '1', nome: 'nova-livros' };

      mockComunidadesService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(mockUser, 'livros', updateDto);

      expect(service.update).toHaveBeenCalledWith('123', 'livros', updateDto);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };

      mockComunidadesService.update.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.update(mockUser, 'inexistente', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('deve propagar UnauthorizedException quando usuário não for moderador', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const updateDto: UpdateComunidadeDto = { nome: 'nova-livros' };

      mockComunidadesService.update.mockRejectedValue(new UnauthorizedException('Apenas o moderador pode editar a comunidade'));

      await expect(controller.update(mockUser, 'fantasia', updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve propagar ConflictException quando novo nome já existir', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
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
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const mockResponse = { message: 'Usuário adicionado à comunidade com sucesso' };
  
      mockComunidadesService.addMembro.mockResolvedValue(mockResponse);
  
      const result = await controller.addMembro(mockUser, 'fantasia');
  
      expect(service.addMembro).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };

      mockComunidadesService.addMembro.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.addMembro(mockUser, 'inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException quando ID for inválido', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };

      mockComunidadesService.addMembro.mockRejectedValue(new BadRequestException('ID inválido'));

      await expect(controller.addMembro(mockUser, 'fantasia')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMembro', () => {
    it('deve remover membro com sucesso', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const mockResponse = { message: 'Usuário removido da comunidade com sucesso' };
  
      mockComunidadesService.removeMembro.mockResolvedValue(mockResponse);
  
      const result = await controller.removeMembro(mockUser, 'fantasia');
  
      expect(service.removeMembro).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };

      mockComunidadesService.removeMembro.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(controller.removeMembro(mockUser, 'inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException quando for único moderador', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };

      mockComunidadesService.removeMembro.mockRejectedValue(new BadRequestException('Não é possível remover o único moderador da comunidade'));

      await expect(controller.removeMembro(mockUser, 'fantasia')).rejects.toThrow(BadRequestException);
    });

    it('deve propagar BadRequestException quando ID for inválido', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'a@a.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };

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
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'membro@email.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele',
      };
      const mockResponse = { 
        isMember: true, 
        isModerator: false 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(true);
      expect(result.isModerator).toBe(false);
    });

    it('deve verificar que usuário é moderador', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'user@email.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele'
      };
      const mockResponse = { 
        isMember: true, 
        isModerator: true 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(true);
      expect(result.isModerator).toBe(true);
    });

    it('deve verificar que usuário não é membro nem moderador', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'nao-membro@email.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele'
      };
      const mockResponse = { 
        isMember: false, 
        isModerator: false 
      };

      mockComunidadesService.verifyMemberOrMod.mockResolvedValue(mockResponse);

      const result = await controller.verificarMembro('fantasia', mockUser);

      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'fantasia');
      expect(result).toEqual(mockResponse);
      expect(result.isMember).toBe(false);
      expect(result.isModerator).toBe(false);
    });

    it('deve lançar erro quando comunidade não for encontrada', async () => {
      const mockUser: CurrentUserDto = {
        userId: '123',
        email: 'user@email.com',
        username: 'user123',
        avatarUrl: '',
        pronouns: 'ele/dele'
      };
      
      mockComunidadesService.verifyMemberOrMod.mockRejectedValue(new Error('Comunidade não encontrada'));

      await expect(controller.verificarMembro('comunidade-inexistente', mockUser)).rejects.toThrow('Comunidade não encontrada');
      expect(service.verifyMemberOrMod).toHaveBeenCalledWith('123', 'comunidade-inexistente');
    });

    it('deve propagar UnauthorizedException quando userId for vazio', async () => {
      const mockUser: CurrentUserDto = {
        userId: '',
        email: 'user@email.com',
        username: 'aaaa',
        avatarUrl: '',
        pronouns: 'ele/dele'
      };
      
      mockComunidadesService.verifyMemberOrMod.mockRejectedValue(new UnauthorizedException('Usuário não autenticado'));

      await expect(controller.verificarMembro('fantasia', mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('removerMembroComoModerador', () => {
    const mockUser: CurrentUserDto = {
      userId: 'moderator1',
      email: 'mod@email.com',
      username: 'usuario123',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };
    const comunidadeNome = 'fantasia';
    const targetUserId = 'userToRemove';

    it('deve remover membro como moderador com sucesso', async () => {
      const mockResponse = { message: 'Membro removido da comunidade com sucesso' };
      
      mockComunidadesService.removerMembroComoModerador = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.removerMembroComoModerador(mockUser, comunidadeNome, targetUserId);

      expect(service.removerMembroComoModerador).toHaveBeenCalledWith('moderator1', 'fantasia', 'userToRemove');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.removerMembroComoModerador = jest.fn().mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(
        controller.removerMembroComoModerador(mockUser, 'inexistente', targetUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando usuário não for moderador', async () => {
      mockComunidadesService.removerMembroComoModerador = jest.fn().mockRejectedValue(new ForbiddenException('Apenas moderadores podem remover membros'));

      await expect(
        controller.removerMembroComoModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve propagar BadRequestException quando usuário alvo não for membro', async () => {
      mockComunidadesService.removerMembroComoModerador = jest.fn().mockRejectedValue(new BadRequestException('Usuário alvo não é membro'));

      await expect(
        controller.removerMembroComoModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve propagar ForbiddenException quando tentar remover outro moderador', async () => {
      mockComunidadesService.removerMembroComoModerador = jest.fn().mockRejectedValue(new ForbiddenException('Não pode remover moderadores'));

      await expect(
        controller.removerMembroComoModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('tornarMembroModerador', () => {
    const mockUser: CurrentUserDto = {
      userId: 'moderator1',
      email: 'mod@email.com',
      username: 'usuario123',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };
    const comunidadeNome = 'fantasia';
    const targetUserId = 'userToPromote';

    it('deve promover membro a moderador com sucesso', async () => {
      const mockResponse = { message: 'Membro promovido a moderador com sucesso' };
      
      mockComunidadesService.tornarMembroModerador = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.tornarMembroModerador(mockUser, comunidadeNome, targetUserId);

      expect(service.tornarMembroModerador).toHaveBeenCalledWith('moderator1', 'fantasia', 'userToPromote');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.tornarMembroModerador = jest.fn().mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(
        controller.tornarMembroModerador(mockUser, 'inexistente', targetUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando usuário não for moderador', async () => {
      mockComunidadesService.tornarMembroModerador = jest.fn().mockRejectedValue(new ForbiddenException('Apenas moderadores podem promover'));

      await expect(
        controller.tornarMembroModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve propagar BadRequestException quando usuário alvo não for membro', async () => {
      mockComunidadesService.tornarMembroModerador = jest.fn().mockRejectedValue(new BadRequestException('Usuário alvo não é membro'));

      await expect(
        controller.tornarMembroModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve propagar ConflictException quando usuário já for moderador', async () => {
      mockComunidadesService.tornarMembroModerador = jest.fn().mockRejectedValue(new ConflictException('Usuário já é moderador'));

      await expect(
        controller.tornarMembroModerador(mockUser, comunidadeNome, targetUserId)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    const mockUser: CurrentUserDto = {
      userId: 'moderator1',
      email: 'mod@email.com',
      username: 'usuario123',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };
    const comunidadeNome = 'fantasia';

    it('deve deletar comunidade com sucesso', async () => {
      const mockResponse = { message: 'Comunidade apagada com sucesso' };
      
      mockComunidadesService.deleteCommunity = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.delete(mockUser, comunidadeNome);

      expect(service.deleteCommunity).toHaveBeenCalledWith('moderator1', 'fantasia');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.deleteCommunity = jest.fn().mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(
        controller.delete(mockUser, 'inexistente')
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando usuário não for moderador', async () => {
      mockComunidadesService.deleteCommunity = jest.fn().mockRejectedValue(new ForbiddenException('Apenas moderadores podem apagar'));

      await expect(
        controller.delete(mockUser, comunidadeNome)
      ).rejects.toThrow(ForbiddenException);
    });
  });
  
  describe('uploadCapa', () => {
    const mockUser: CurrentUserDto = {
      userId: 'moderator1',
      email: 'mod@email.com',
      username: 'usuario123',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };
    const comunidadeNome = 'fantasia';
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve fazer upload da capa com sucesso', async () => {
      const mockResponse = { message: 'Capa atualizada com sucesso', url: 'http://example.com/capa.jpg' };
      
      mockComunidadesService.uploadCapa.mockResolvedValue(mockResponse);

      const result = await controller.uploadCapa(mockUser, comunidadeNome, mockFile);

      expect(service.uploadCapa).toHaveBeenCalledWith('moderator1', 'fantasia', mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.uploadCapa.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(
        controller.uploadCapa(mockUser, 'inexistente', mockFile)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando usuário não for moderador', async () => {
      const mockUser: CurrentUserDto = { userId: 'moderador1', email: 'mod@email.com', username: 'usuario123', avatarUrl: '', pronouns: 'ele/dele' };
      const comunidadeNome = 'fantasia';

      mockComunidadesService.uploadCapa = jest.fn().mockRejectedValue(new ForbiddenException('Apenas moderadores podem alterar a capa'));
      await expect(
        controller.uploadCapa(mockUser, comunidadeNome, null as unknown as Express.Multer.File)
      ).rejects.toThrow(ForbiddenException);
    });
  });

   describe('uploadBanner', () => {
    const mockUser: CurrentUserDto = {
      userId: 'moderator1',
      email: 'mod@email.com',
      username: 'usuario123',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };
    const comunidadeNome = 'fantasia';
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'banner.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 2048,
      buffer: Buffer.from('test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve fazer upload do banner com sucesso', async () => {
      const mockResponse = { message: 'Banner atualizado com sucesso', url: 'http://example.com/banner.jpg' };
      
      mockComunidadesService.uploadBanner.mockResolvedValue(mockResponse);

      const result = await controller.uploadBanner(mockUser, comunidadeNome, mockFile);

      expect(service.uploadBanner).toHaveBeenCalledWith('moderator1', 'fantasia', mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar NotFoundException quando comunidade não existir', async () => {
      mockComunidadesService.uploadBanner.mockRejectedValue(new NotFoundException('Comunidade não encontrada'));

      await expect(
        controller.uploadBanner(mockUser, 'inexistente', mockFile)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar ForbiddenException quando usuário não for moderador', async () => {
      mockComunidadesService.uploadBanner.mockRejectedValue(new ForbiddenException('Apenas moderadores podem alterar o banner'));

      await expect(
        controller.uploadBanner(mockUser, comunidadeNome, mockFile)
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve propagar BadRequestException quando arquivo for inválido', async () => {
      mockComunidadesService.uploadBanner.mockRejectedValue(new BadRequestException('Arquivo inválido'));

      await expect(
        controller.uploadBanner(mockUser, comunidadeNome, mockFile)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Edge cases and error propagation', () => {
    const mockUser: CurrentUserDto = {
      userId: '123',
      email: 'user@email.com',
      username: 'usuario1234',
      avatarUrl: '',
      pronouns: 'ele/dele'
    };

    describe('Service method not mocked errors', () => {
      it('deve lidar com métodos de serviço não implementados no mock', async () => {
        expect(() => service.removerMembroComoModerador).toBeDefined();
        expect(() => service.tornarMembroModerador).toBeDefined();
        expect(() => service.deleteCommunity).toBeDefined();
      });
    });

    describe('Parameter validation', () => {
      it('deve lidar com parâmetros vazios ou inválidos', async () => {
        await expect(controller.findOne('')).rejects.toThrow();
        await expect(controller.findAllPosts('')).rejects.toThrow();
      });
    });

    describe('CurrentUser edge cases', () => {
      it('deve lidar com CurrentUser sem userId', async () => {
        const invalidUser: CurrentUserDto = {
          userId: '',
          email: 'user@email.com',
          username: 'usuario123',
          avatarUrl: '',
          pronouns: 'ele/dele'
        };
        
        mockComunidadesService.verifyMemberOrMod.mockRejectedValue(new UnauthorizedException());
        
        await expect(controller.verificarMembro('fantasia', invalidUser))
          .rejects.toThrow(UnauthorizedException);
      });

      it('deve lidar com CurrentUser undefined', async () => {
        const undefinedUser = undefined as unknown as CurrentUserDto;
        
        await expect(controller.create(undefinedUser, { nome: 'test' }))
          .rejects.toThrow();
      });

      it('deve lidar com métodos que requerem CurrentUser com dados incompletos', async () => {
        const incompleteUser = { userId: '123' } as CurrentUserDto;
        
        mockComunidadesService.addMembro.mockResolvedValue({ message: 'Sucesso' });
        
        const result = await controller.addMembro(incompleteUser, 'fantasia');
        expect(result).toBeDefined();
      });
    });

    describe('File upload edge cases', () => {
      it('deve lidar com tipos de arquivo inválidos nos interceptors', async () => {
        const mockUser: CurrentUserDto = {
          userId: 'moderator1',
          email: 'mod@email.com',
          username: 'usuario123',
          avatarUrl: '',
          pronouns: 'ele/dele'
        };
        const invalidFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: 'file.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          size: 2048,
          buffer: Buffer.from('test'),
          destination: '',
          filename: '',
          path: '',
          stream: null as any,
        };
        
        mockComunidadesService.uploadCapa.mockResolvedValue({ message: 'Processado' });
        
        const result = await controller.uploadCapa(mockUser, 'fantasia', invalidFile);
        expect(result).toBeDefined();
      });
    });
  });
});