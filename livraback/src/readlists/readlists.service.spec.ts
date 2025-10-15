import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

describe('ReadlistsService', () => {
  let service: ReadlistsService;

  const mockReadlist = { _id: '1', nome: 'Minha Readlist', criador: 'user123' };

  // mock da instância retornada por `new this.readlistModel(...)`
  const mockSave = jest.fn().mockResolvedValue(mockReadlist);

  // mock do Model Mongoose
  const mockReadlistModel = {
    // chamado como: new this.readlistModel()
    prototype: {
      save: mockSave,
    },
    // usado como: this.readlistModel.find(...)
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockReadlist]),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReadlist),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockReadlist, nome: 'Atualizado' }),
    }),
    deleteOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadlistsService,
        {
          provide: getModelToken('Readlist'),
          useValue: mockReadlistModel,
        },
      ],
    }).compile();

    service = module.get<ReadlistsService>(ReadlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a readlist', async () => {
      // Simula o uso de "new this.readlistModel()"
      const createDto: CreateReadlistDto = { nome: 'Minha Readlist' };

      // Cria uma instância mockada com save
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      // Substitui o model com o construtor falso
      const customService = new ReadlistsService(mockConstructor as any);

      const result = await customService.create('user123', createDto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockReadlist);
    });
  });

  describe('findAll', () => {
    it('should return all readlists for user', async () => {
      const result = await service.findAll('user123');
      expect(mockReadlistModel.find).toHaveBeenCalledWith({ criador: 'user123' });
      expect(result).toEqual([mockReadlist]);
    });
  });

  describe('findOne', () => {
    it('should return one readlist by id and user', async () => {
      const result = await service.findOne('user123', '1');
      expect(mockReadlistModel.findOne).toHaveBeenCalledWith({ _id: '1', criador: 'user123' });
      expect(result).toEqual(mockReadlist);
    });
  });

  describe('update', () => {
    it('should update the readlist', async () => {
      const updateDto: UpdateReadlistDto = { nome: 'Atualizado' };
      const result = await service.update('user123', '1', updateDto);
      expect(mockReadlistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '1', criador: 'user123' },
        { $set: updateDto },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({ ...mockReadlist, nome: 'Atualizado' });
    });
  });

  describe('remove', () => {
    it('should remove a readlist by id and user', async () => {
      const result = await service.remove('user123', '1');
      expect(mockReadlistModel.deleteOne).toHaveBeenCalledWith({ _id: '1', criador: 'user123' });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });
});