import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImagensConsumer } from './imagens.consumer';
import * as amqp from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';

jest.mock('amqp-connection-manager');

describe('ImagensConsumer', () => {
  let consumer: ImagensConsumer;
  let mockChannel: any;
  let mockChannelWrapper: any;
  let mockConnection: any;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('amqp://localhost:5672'),
  };

  beforeEach(async () => {
    mockChannel = {
      prefetch: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    mockChannelWrapper = {
      waitForConnect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockImplementation((options) => {
        if (options.setup) {
          options.setup(mockChannel);
        }
        return mockChannelWrapper;
      }),
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (amqp.connect as jest.Mock) = jest.fn().mockReturnValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagensConsumer,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    consumer = module.get<ImagensConsumer>(ImagensConsumer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('inicializar', () => {
    it('deve conectar ao RabbitMQ e configurar prefetch de 3', async () => {
      await consumer.inicializar();

      expect(amqp.connect).toHaveBeenCalled();
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.prefetch).toHaveBeenCalledWith(3);
      expect(mockChannel.consume).toHaveBeenCalledWith(
        'imagens.processar',
        expect.any(Function),
        { noAck: false }
      );
    });
  });

  describe('processarMensagem', () => {
    let consumeCallback: (msg: ConsumeMessage | null) => Promise<void>;

    beforeEach(async () => {
      await consumer.inicializar();
      
      const consumeCall = mockChannel.consume.mock.calls[0];
      consumeCallback = consumeCall[1];
    });

    it('deve processar imagens de post', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          tipo: 'post',
          postId: 'post123',
          imagens: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        })),
        fields: {} as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar imagem de perfil', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          tipo: 'perfil',
          userId: 'user123',
          imagemUrl: 'avatar.jpg',
        })),
        fields: {} as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar imagem de comunidade', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          tipo: 'comunidade',
          comunidadeId: 'com123',
          imagemUrl: 'banner.jpg',
        })),
        fields: {} as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve fazer ACK mesmo para tipo desconhecido', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          tipo: 'tipo-desconhecido',
        })),
        fields: {} as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve enviar para DLQ em caso de erro', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from('JSON inválido'),
        fields: {} as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      // Sem retry - vai direto para DLQ
      expect(mockChannel.nack).toHaveBeenCalledWith(mensagem, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('deve retornar imediatamente se mensagem for null', async () => {
      await consumeCallback(null);

      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(async () => {
      await consumer.inicializar();
    });

    it('deve fechar canal e conexão', async () => {
      await consumer.onModuleDestroy();

      expect(mockChannelWrapper.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('não deve lançar erro se close falhar', async () => {
      mockChannelWrapper.close.mockRejectedValue(new Error('Close failed'));

      await expect(consumer.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
