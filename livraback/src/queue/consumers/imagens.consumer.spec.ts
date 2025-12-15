import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImagensConsumer } from './imagens.consumer';
import { FILAS, ROUTING_KEYS } from '../queue.constants';
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

  it('getQueueName deve retornar a fila correta', () => {
    expect(consumer['getQueueName']()).toBe(FILAS.PROCESSAR_IMAGENS);
  });

  it('getPrefetchCount deve retornar 3', () => {
    expect(consumer['getPrefetchCount']()).toBe(3);
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

  describe('processar', () => {
    it('deve chamar processarImagensPost para routingKey IMAGEM_POST_UPLOAD', async () => {
      const spy = jest.spyOn<any, any>(consumer, 'processarImagensPost').mockResolvedValue(undefined);
      const dados = { postId: 'post123', imagens: ['img1.jpg'] };

      await (consumer as any).processar(dados, ROUTING_KEYS.IMAGEM_POST_UPLOAD);

      expect(spy).toHaveBeenCalledWith(dados);
    });

    it('deve chamar processarImagemPerfil para routingKey IMAGEM_USUARIO_UPLOAD', async () => {
      const spy = jest.spyOn<any, any>(consumer, 'processarImagemPerfil').mockResolvedValue(undefined);
      const dados = { userId: 'user123', imagemUrl: 'avatar.jpg' };

      await (consumer as any).processar(dados, ROUTING_KEYS.IMAGEM_USUARIO_UPLOAD);

      expect(spy).toHaveBeenCalledWith(dados);
    });

    it('deve chamar processarImagemComunidade para routingKey IMAGEM_COMUNIDADE_UPLOAD', async () => {
      const spy = jest.spyOn<any, any>(consumer, 'processarImagemComunidade').mockResolvedValue(undefined);
      const dados = { comunidadeId: 'com123', imagemUrl: 'banner.jpg' };

      await (consumer as any).processar(dados, ROUTING_KEYS.IMAGEM_COMUNIDADE_UPLOAD);

      expect(spy).toHaveBeenCalledWith(dados);
    });

    it('deve logar warning para routingKey desconhecida', async () => {
      const loggerWarn = jest.spyOn((consumer as any).logger, 'warn').mockImplementation();

      await (consumer as any).processar({}, 'ROTA_DESCONHECIDA');

      expect(loggerWarn).toHaveBeenCalledWith(expect.stringContaining('Tipo de imagem não tratado'));
    });
  });

  describe('processarImagensPost', () => {
    it('deve logar processamento de imagens de post', async () => {
      const loggerLog = jest.spyOn((consumer as any).logger, 'log').mockImplementation();
      const dados = { postId: 'post123', imagens: ['img1.jpg', 'img2.jpg'] };

      await (consumer as any).processarImagensPost(dados);

      expect(loggerLog).toHaveBeenCalledWith('Processando imagens de post: post123');
    });
  });

  describe('processarImagemPerfil', () => {
    it('deve logar processamento de imagem de perfil', async () => {
      const loggerLog = jest.spyOn((consumer as any).logger, 'log').mockImplementation();
      const dados = { userId: 'user123', imagemUrl: 'avatar.jpg' };

      await (consumer as any).processarImagemPerfil(dados);

      expect(loggerLog).toHaveBeenCalledWith('Processando imagem de perfil: user123');
    });
  });

  describe('processarImagemComunidade', () => {
    it('deve logar processamento de imagem de comunidade', async () => {
      const loggerLog = jest.spyOn((consumer as any).logger, 'log').mockImplementation();
      const dados = { comunidadeId: 'com123', imagemUrl: 'banner.jpg' };

      await (consumer as any).processarImagemComunidade(dados);

      expect(loggerLog).toHaveBeenCalledWith('Processando imagem de comunidade: com123');
    });
  });

  describe('processarMensagem', () => {
    let consumeCallback: (msg: ConsumeMessage | null) => Promise<void>;

    beforeEach(async () => {
      await consumer.inicializar();
      
      const consumeCall = mockChannel.consume.mock.calls[0];
      consumeCallback = consumeCall[1];
    });

    it('deve processar imagens de post com routing key', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          imagens: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        })),
        fields: { routingKey: ROUTING_KEYS.IMAGEM_POST_UPLOAD } as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar imagem de perfil com routing key', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          userId: 'user123',
          imagemUrl: 'avatar.jpg',
        })),
        fields: { routingKey: ROUTING_KEYS.IMAGEM_USUARIO_UPLOAD } as any,
        properties: { headers: {} } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar imagem de comunidade com routing key', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          comunidadeId: 'com123',
          imagemUrl: 'banner.jpg',
        })),
        fields: { routingKey: ROUTING_KEYS.IMAGEM_COMUNIDADE_UPLOAD } as any,
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
        fields: { routingKey: 'routing.desconhecida' } as any,
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
