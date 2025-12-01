import { Test, TestingModule } from '@nestjs/testing';
import { ReadlistsController } from './readlists.controller';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

describe('ReadlistsController', () => {
  let controller: ReadlistsController;
  let service: ReadlistsService;

  const mockUser = { userId: 'user123', email: 'user@example.com', username: 'user', avatarUrl: 'avatar-test.png', pronouns: 'he/him' };

  const mockReadlistsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addLivro: jest.fn(),
    removeLivro: jest.fn(),
    findAllPublic: jest.fn(),
    updatePhoto: jest.fn(),
    addReadlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadlistsController],
      providers: [
        {
          provide: ReadlistsService,
          useValue: mockReadlistsService,
        },
      ],
    }).compile();

    controller = module.get<ReadlistsController>(ReadlistsController);
    service = module.get<ReadlistsService>(ReadlistsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateReadlistDto = { nome: 'Minha Readlist' };
      const result = { id: '1', ...dto };
      mockReadlistsService.create.mockResolvedValue(result);

      const response = await controller.create(mockUser, dto);
      expect(service.create).toHaveBeenCalledWith(mockUser.userId, dto);
      expect(response).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all readlists for the user', async () => {
      const result = [{ id: '1', nome: 'RL1' }];
      mockReadlistsService.findAll.mockResolvedValue(result);

      const response = await controller.findAll(mockUser);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.userId);
      expect(response).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single readlist', async () => {
      const result = { id: '1', nome: 'RL1' };
      mockReadlistsService.findOne.mockResolvedValue(result);

      const response = await controller.findOne(mockUser, '1');
      expect(service.findOne).toHaveBeenCalledWith(mockUser.userId, '1');
      expect(response).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a readlist', async () => {
      const dto: UpdateReadlistDto = { nome: 'Atualizado' };
      const result = { id: '1', nome: 'Atualizado' };
      mockReadlistsService.update.mockResolvedValue(result);

      const response = await controller.update(mockUser, '1', dto);
      expect(service.update).toHaveBeenCalledWith(mockUser.userId, '1', dto);
      expect(response).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should delete a readlist', async () => {
      const result = { deletedCount: 1 };
      mockReadlistsService.remove.mockResolvedValue(result);

      const response = await controller.remove(mockUser, '1');
      expect(service.remove).toHaveBeenCalledWith(mockUser.userId, '1');
      expect(response).toEqual(result);
    });
  });

  describe('addLivro', () => {
    it('should add a livro to readlist', async () => {
      const dto = { livroIds: ['livro123', 'livro456'] };
      const result = { id: '1', livros: dto.livroIds };

      mockReadlistsService.addLivro.mockResolvedValue(result);

      const response = await controller.addLivro(mockUser, '1', dto);

      expect(service.addLivro).toHaveBeenCalledWith(mockUser.userId, '1', dto.livroIds);
      expect(response).toEqual(result);
    });
  });

  describe('removeLivro', () => {
    it('should remove a livro from readlist', async () => {
      const result = { id: '1', livros: [] };
      mockReadlistsService.removeLivro.mockResolvedValue(result);

      const response = await controller.removeLivro(mockUser, '1', 'livro123');
      expect(service.removeLivro).toHaveBeenCalledWith(mockUser.userId, '1', 'livro123');
      expect(response).toEqual(result);
    });
  });

  describe('findAllPublic', () => {
    it('should return all public readlists for a given username', async () => {
      const username = 'otherUser456';
      const result = [{ id: '1', nome: 'Readlist Pública', isPublic: true }];
      mockReadlistsService.findAllPublic.mockResolvedValue(result);

      const response = await controller.findAllPublic(username);
      expect(service.findAllPublic).toHaveBeenCalledWith(username);
      expect(response).toEqual(result);
    });
  });

  describe('updatePhoto', () => {
    const fakeUser = { userId: 'user-id' };

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'avatar.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image'),
      size: 1234,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve lançar BadRequestException se nenhum arquivo for enviado', async () => {
      await expect(controller.updatePhoto(fakeUser as any, undefined as any, 'slug')).rejects.toThrow(
        'Nenhum arquivo foi enviado'
      );
    });

    it('deve chamar o service e retornar o resultado', async () => {
      const mockResponse = { capa_url: 'mocked.com/teste.png' };
      mockReadlistsService.updatePhoto = jest.fn().mockResolvedValue(mockResponse);

      const result = await controller.updatePhoto(fakeUser as any, fakeFile, 'slug');

      expect(service.updatePhoto).toHaveBeenCalledWith(fakeUser.userId, fakeFile, 'slug');
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar erro do service', async () => {
      mockReadlistsService.updatePhoto = jest.fn().mockRejectedValue(new Error('Erro interno'));
      await expect(controller.updatePhoto(fakeUser as any, fakeFile, 'slug')).rejects.toThrow('Erro interno');
    });
  });

  describe('addReadlist', () => {
    it('should add livro to multiple readlists', async () => {
      const livroId = 'livro999';
      const dto = { readlistIds: ['rl1', 'rl2', 'rl3'] };

      const result = { livroId, readlists: dto.readlistIds };
      mockReadlistsService.addReadlist.mockResolvedValue(result);

      const response = await controller.addReadlist(livroId, dto);

      expect(service.addReadlist).toHaveBeenCalledWith(livroId, dto.readlistIds);
      expect(response).toEqual(result);
    });
  });
});