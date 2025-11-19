import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReadlistsModule } from './readlists/readlists.module';
import { ComunidadesModule } from './comunidades/comunidades.module';
import { QueueProducerService } from './queue/queue.producer.service';

describe('App Integration with Mocks', () => {
  let app: INestApplication;

  // Mock ConfigService
  const mockConfigService = {
    getOrThrow: (key: string) => {
      const testEnv = {
        DB_URL: 'mongodb://localhost:27017/testdb',
        JWT_SECRET: 'my-super-secret',
        RABBITMQ_URL: 'amqp://localhost:5672',
      };
      if (testEnv[key]) return testEnv[key];
      throw new Error(`Config key ${key} not mocked`);
    },
    get: (key: string) => {
      const testEnv = {
        DB_URL: 'mongodb://localhost:27017/testdb',
        JWT_SECRET: 'my-super-secret',
        RABBITMQ_URL: 'amqp://localhost:5672',
      };
      return testEnv[key] || null;
    },
  };

  // Mock do model User
  const mockUserModel = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: 'mockUserId', ...dto })),
    findById: jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'mockUserId', readlists: ['readlist1'] }),
  };

  // Mock do model Readlist
  const mockReadlistModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockReadlistId', nome: 'Atualizado' }),
    }),
    deleteOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }),
    create: jest.fn().mockResolvedValue({ _id: 'mockReadlistId', nome: 'Nova Readlist' }),
    prototype: {
      save: jest.fn().mockResolvedValue({ _id: 'mockReadlistId', nome: 'Nova Readlist' }),
    },
  };

  // Mock do model Comunidade
  const mockComunidadeModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockReadlistId', nome: 'Atualizado' }),
    }),
  };

  // Mock do QueueProducerService
  const mockQueueProducer = {
    publish: jest.fn().mockResolvedValue(undefined),
    publicarNaFila: jest.fn().mockResolvedValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    setupExchangesAndQueues: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    jest.setTimeout(10000); // caso precise de mais tempo para iniciar

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // Provemos o QueueProducerService mockado globalmente
        {
          provide: QueueProducerService,
          useValue: mockQueueProducer,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond to GET /', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
  });
});