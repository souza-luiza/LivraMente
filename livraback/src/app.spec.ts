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
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LlmModule } from './llm/llm.module';
import { SearchModule } from './search/search.module';
import { LivrosModule } from './livros/livros.module';
import { LlmApiService } from './llm/llm.api.service';
import { QueueProducerService } from './queue/queue.producer.service';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { NotificacoesConsumer } from './queue/consumers/notificacoes.consumer';
import { ImagensConsumer } from './queue/consumers/imagens.consumer';
import { MetricasConsumer } from './queue/consumers/metricas.consumer';

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
      exec: jest.fn().mockResolvedValue({ _id: 'mockComunidadeId', nome: 'Atualizado' }),
    }),
  };

  // Mock do model Post
  const mockPostModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockPostId', nome: 'Atualizado' }),
    }),
  };

  // Mock do model Comment
  const mockCommentModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockCommentId', nome: 'Atualizado' }),
    }),
  };

  // Mock do model Story
  const mockStoryModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockStoryId', nome: 'Atualizado' }),
    }),
  };

  const mockLivroModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockStoryId', nome: 'Atualizado' }),
    }),
  };

  const mockAutorModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'mockStoryId', nome: 'Atualizado' }),
    }),
  };

  const mockNotificacaoModel = {
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ 
      _id: 'mockNotificacaoId', 
      ...dto,
      populate: jest.fn().mockResolvedValue({ _id: 'mockNotificacaoId', ...dto }),
    })),
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  const mockLlmApiService = {
    onModuleInit: jest.fn(),
    generate: jest.fn().mockResolvedValue('mocked response'),
  };

  const mockQueueProducer = {
    publish: jest.fn().mockResolvedValue(undefined),
    publicarNaFila: jest.fn().mockResolvedValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    setupExchangesAndQueues: jest.fn().mockResolvedValue(undefined),
  };

  const mockNotificacoesConsumer = {
    inicializar: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  const mockImagensConsumer = {
    inicializar: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  const mockMetricasConsumer = {
    inicializar: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  

  beforeAll(async () => {
    jest.setTimeout(10000); // caso precise de mais tempo para iniciar

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
        AuthModule,
        ReadlistsModule,
        PostsModule,
        ComunidadesModule,
        CommentsModule,
        LlmModule,
        SearchModule,
        LivrosModule,
        NotificacoesModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(getModelToken('User'))
      .useValue(mockUserModel)
      .overrideProvider(getModelToken('Readlist'))
      .useValue(mockReadlistModel)
      .overrideProvider(getModelToken('Comunidade'))
      .useValue(mockComunidadeModel)
      .overrideProvider(getModelToken('Post'))
      .useValue(mockPostModel)
      .overrideProvider(getModelToken('Comentario'))
      .useValue(mockCommentModel)
      .overrideProvider(getModelToken('Story'))
      .useValue(mockStoryModel)
      .overrideProvider(getModelToken('Livro'))
      .useValue(mockLivroModel)
      .overrideProvider(getModelToken('Autor'))
      .useValue(mockAutorModel)
      .overrideProvider(getModelToken('Notificacao'))
      .useValue(mockNotificacaoModel)
      .overrideProvider(LlmApiService)
      .useValue(mockLlmApiService)
      .overrideProvider(QueueProducerService)
      .useValue(mockQueueProducer)
      .overrideProvider(NotificacoesConsumer)
      .useValue(mockNotificacoesConsumer)
      .overrideProvider(ImagensConsumer)
      .useValue(mockImagensConsumer)
      .overrideProvider(MetricasConsumer)
      .useValue(mockMetricasConsumer)
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