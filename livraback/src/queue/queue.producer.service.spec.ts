import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QueueProducerService } from './queue.producer.service';
import * as amqp from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

jest.mock('amqp-connection-manager');

describe('QueueProducerService', () => {
  let service: QueueProducerService;
  let mockConnection: any;
  let mockChannelWrapper: any;
  let mockChannel: any;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('amqp://localhost:5672'),
  };

  beforeEach(async () => {
    // Mock do canal
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      prefetch: jest.fn().mockResolvedValue(undefined),
    };

    // Mock do channel wrapper
    mockChannelWrapper = {
      waitForConnect: jest.fn().mockResolvedValue(undefined),
      sendToQueue: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock da conexão
    mockConnection = {
      createChannel: jest.fn().mockImplementation((options) => {
        // Executa setup de forma assíncrona, mas retorna wrapper síncronamente
        if (options.setup) {
          // Chama setup mas não espera (simula comportamento real)
          Promise.resolve(options.setup(mockChannel));
        }
        return mockChannelWrapper;
      }),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock da função connect
    (amqp.connect as jest.Mock) = jest.fn().mockReturnValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueProducerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QueueProducerService>(QueueProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connect', () => {
    it('deve conectar ao RabbitMQ com sucesso', async () => {
      await service.connect();

      expect(amqp.connect).toHaveBeenCalledWith(
        ['amqp://localhost:5672'],
        expect.objectContaining({
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        })
      );

      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannelWrapper.waitForConnect).toHaveBeenCalled();
    });

    it('deve configurar exchanges e filas durante a conexão', async () => {
      await service.connect();

      // Aguarda promises pendentes do setup
      await new Promise(resolve => setImmediate(resolve));

      // Verifica se as exchanges foram criadas
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'dlq.exchange',
        'fanout',
        { durable: true }
      );

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'livramente.eventos',
        'topic',
        { durable: true }
      );

      // Verifica se as filas foram criadas
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'dlq.mensagens.falhas',
        expect.objectContaining({ durable: true })
      );

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'notificacoes.enviar',
        expect.objectContaining({ durable: true })
      );
    });

    it('deve criar bindings entre exchanges e filas', async () => {
      await service.connect();

      // Aguarda promises pendentes do setup
      await new Promise(resolve => setImmediate(resolve));

      // Verifica alguns bindings importantes
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        'notificacoes.enviar',
        'livramente.eventos',
        'notificar.*'
      );

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        'metricas.atualizar',
        'livramente.eventos',
        'metricas.*'
      );
    });

    it('deve lançar erro se falhar ao conectar', async () => {
      const error = new Error('Connection failed');
      (amqp.connect as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('publicarNaFila', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('deve publicar mensagem em fila específica com sucesso', async () => {
      const mensagem = { postId: '123', autorId: '456' };
      const nomeFila = 'notificacoes.enviar';

      await service.publicarNaFila(nomeFila, mensagem);

      expect(mockChannelWrapper.sendToQueue).toHaveBeenCalledWith(
        nomeFila,
        mensagem,
        expect.objectContaining({
          persistent: true,
          priority: 0,
          headers: expect.objectContaining({
            timestamp: expect.any(Number),
            retryCount: 0,
          }),
        })
      );
    });

    it('deve publicar mensagem com prioridade customizada', async () => {
      const mensagem = { urgente: true };
      const nomeFila = 'notificacoes.enviar';

      await service.publicarNaFila(nomeFila, mensagem, {
        prioridade: 10,
      });

      expect(mockChannelWrapper.sendToQueue).toHaveBeenCalledWith(
        nomeFila,
        mensagem,
        expect.objectContaining({
          priority: 10,
        })
      );
    });

    it('deve incluir cabeçalhos customizados', async () => {
      const mensagem = { data: 'test' };
      const nomeFila = 'notificacoes.enviar';
      const cabecalhos = { customHeader: 'value' };

      await service.publicarNaFila(nomeFila, mensagem, {
        cabecalhos,
      });

      expect(mockChannelWrapper.sendToQueue).toHaveBeenCalledWith(
        nomeFila,
        mensagem,
        expect.objectContaining({
          headers: expect.objectContaining({
            customHeader: 'value',
            timestamp: expect.any(Number),
            retryCount: 0,
          }),
        })
      );
    });

    it('deve lançar erro se publicação falhar', async () => {
      const error = new Error('Publish failed');
      mockChannelWrapper.sendToQueue.mockRejectedValue(error);

      await expect(
        service.publicarNaFila('test.queue', { data: 'test' })
      ).rejects.toThrow('Publish failed');
    });
  });

  describe('publish', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('deve publicar evento com routing key com sucesso', async () => {
      const routingKey = 'notificar.post.criado';
      const mensagem = { postId: '123' };

      await service.publish(routingKey, mensagem);

      expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
        'livramente.eventos',
        routingKey,
        mensagem,
        expect.objectContaining({
          persistent: true,
          priority: 0,
          headers: expect.objectContaining({
            timestamp: expect.any(Number),
            retryCount: 0,
          }),
        })
      );
    });

    it('deve publicar evento com opções customizadas', async () => {
      const routingKey = 'metricas.post.criado';
      const mensagem = { data: 'test' };

      await service.publish(routingKey, mensagem, {
        prioridade: 5,
        cabecalhos: { source: 'api' },
      });

      expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
        'livramente.eventos',
        routingKey,
        mensagem,
        expect.objectContaining({
          priority: 5,
          headers: expect.objectContaining({
            source: 'api',
            timestamp: expect.any(Number),
            retryCount: 0,
          }),
        })
      );
    });

    it('deve lançar erro se publish falhar', async () => {
      const error = new Error('Publish failed');
      mockChannelWrapper.publish.mockRejectedValue(error);

      await expect(
        service.publish('test.key', { data: 'test' })
      ).rejects.toThrow('Publish failed');
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('deve fechar canal e conexão ao destruir módulo', async () => {
      await service.onModuleDestroy();

      expect(mockChannelWrapper.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('não deve lançar erro se close falhar', async () => {
      mockChannelWrapper.close.mockRejectedValue(new Error('Close failed'));

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
