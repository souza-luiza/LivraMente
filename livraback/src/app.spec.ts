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

describe('App Integration with Mocks', () => {
  let app: INestApplication;

  // Mock ConfigService (simulando variáveis do .env)
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
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: 'mockId', ...dto })),
  };

  // Mock do model Readlist
  const mockReadlistModel = {
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) }),
  };

  beforeAll(async () => {
    jest.setTimeout(10000);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
        AuthModule,
        ReadlistsModule,
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

  it('should respond to GET /', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});