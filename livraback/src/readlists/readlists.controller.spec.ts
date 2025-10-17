import { Test, TestingModule } from '@nestjs/testing';
import { ReadlistsController } from './readlists.controller';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

describe('ReadlistsController', () => {
  let controller: ReadlistsController;
  let service: ReadlistsService;

  const mockUser = { userId: 'user123', email: 'user@example.com' };

  const mockReadlistsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
    it('should call service.create with correct parameters', async () => {
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
    it('should return a single readlist by id', async () => {
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
});