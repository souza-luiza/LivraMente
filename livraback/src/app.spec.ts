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

describe('App Integration with Mocks', () => {
  let app: INestApplication;

  // Mock ConfigService
  const mockConfigService = {
    getOrThrow: (key: string) => {
      const testEnv = {
        DB_URL: 'mongodb://localhost:27017/testdb',
        JWT_SECRET: 'my-super-secret',
      };
      if (testEnv[key]) return testEnv[key];
      throw new Error(`Config key ${key} not mocked`);
    },
    get: (key: string) => {
      const testEnv = {
        DB_URL: 'mongodb://localhost:27017/testdb',
        JWT_SECRET: 'my-super-secret',
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

  // Mock do model Readlist
  const mockComunidadeModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockReadlistId', nome: 'Atualizado' }),
    }),
  };

  beforeAll(async () => {
    jest.setTimeout(10000); // caso precise de mais tempo para iniciar

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
        AuthModule,
        ReadlistsModule,
        ComunidadesModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(getModelToken('User'))
      .useValue(mockUserModel)
      .overrideProvider(getModelToken('Readlist'))
      .useValue(mockReadlistModel)
      .overrideProvider(getModelToken('Comunidade'))
      .useValue(mockComunidadeModel)
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