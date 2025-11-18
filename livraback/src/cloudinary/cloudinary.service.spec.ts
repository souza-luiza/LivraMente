import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  describe('uploadImage', () => {
    it('deve resolver a Promise com o resultado quando o upload for bem-sucedido', async () => {
      const fakeBuffer = Buffer.from('fake-image-data');
      const fakeResult = { secure_url: 'mocked.com/test.png' };

      // Mock de upload_stream para simular callback de sucesso
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
            const writable = new (require('stream').Writable)({
            write(_chunk, _encoding, done) {
                done();
            },
            final(done) {
                // simula o upload completo
                setImmediate(() => callback(null, fakeResult));
                done();
            },
            });
            return writable;
        },
      );

      const result = await service.uploadImage(fakeBuffer, 'test-folder');

      expect(result).toEqual(fakeResult);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'test-folder', resource_type: 'image' },
        expect.any(Function),
      );
      expect(Readable.from(fakeBuffer)).toBeDefined();
    });

    it('deve rejeitar a Promise quando o upload falhar', async () => {
      const fakeBuffer = Buffer.from('fake-image-data');

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
            const { Writable } = require('stream');
            const writable = new Writable({
            write(_chunk, _encoding, done) {
                done();
            },
            final(done) {
                setImmediate(() => callback(new Error('Falha no upload'), null));
                done();
            },
            });
            return writable;
        },
      );

      await expect(service.uploadImage(fakeBuffer)).rejects.toThrow('Falha no upload');
    });
  });

  describe('deleteImage', () => {
    it('deve chamar cloudinary.uploader.destroy() e retornar o resultado', async () => {
      const mockResponse = { result: 'ok' };
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.deleteImage('public_id_123');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('public_id_123');
      expect(result).toEqual(mockResponse);
    });
  });
});