import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificacoesConsumer } from './notificacoes.consumer';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { ComunidadesService } from '../../comunidades/comunidades.service';
import { TipoNotificacao } from '../../schemas/notificacao.schema';
import * as amqp from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';

jest.mock('amqp-connection-manager');

describe('NotificacoesConsumer', () => {
  let consumer: NotificacoesConsumer;
  let notificacoesService: jest.Mocked<NotificacoesService>;
  let comunidadesService: jest.Mocked<ComunidadesService>;
  let mockChannel: any;
  let mockChannelWrapper: any;
  let mockConnection: any;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('amqp://localhost:5672'),
  };

  const mockNotificacoesService = {
    criar: jest.fn(),
  };

  const mockComunidadesService = {
    findById: jest.fn(),
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
        NotificacoesConsumer,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NotificacoesService,
          useValue: mockNotificacoesService,
        },
        {
          provide: ComunidadesService,
          useValue: mockComunidadesService,
        },
      ],
    }).compile();

    consumer = module.get<NotificacoesConsumer>(NotificacoesConsumer);
    notificacoesService = module.get(NotificacoesService) as jest.Mocked<NotificacoesService>;
    comunidadesService = module.get(ComunidadesService) as jest.Mocked<ComunidadesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('inicializar', () => {
    it('deve conectar ao RabbitMQ e iniciar consumo', async () => {
      await consumer.inicializar();

      expect(amqp.connect).toHaveBeenCalled();
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
      expect(mockChannel.consume).toHaveBeenCalledWith(
        'notificacoes.enviar',
        expect.any(Function),
        { noAck: false }
      );
    });
  });

  describe('processarMensagem', () => {
    let consumeCallback: (msg: ConsumeMessage | null) => Promise<void>;

    beforeEach(async () => {
      await consumer.inicializar();
      
      // Captura o callback passado para consume
      const consumeCall = mockChannel.consume.mock.calls[0];
      consumeCallback = consumeCall[1];
    });

    it('deve processar mensagem de post criado e notificar membros', async () => {
      const mockComunidade = {
        nome: 'Comunidade Teste',
        membros: ['user1', 'user2', 'user3'],
      };

      comunidadesService.findById.mockResolvedValue(mockComunidade as any);

      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          autorId: 'user1',
          comunidadeId: 'com123',
          conteudoPreview: 'Este é um preview do post...',
        })),
        fields: {
          routingKey: 'notificar.post.criado',
        } as any,
        properties: {
          headers: {},
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      // Deve notificar apenas user2 e user3 (excluindo o autor)
      expect(notificacoesService.criar).toHaveBeenCalledTimes(2);
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'user2',
          tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
          mensagem: expect.stringContaining('Novo post em Comunidade Teste'),
          remetente: 'user1',
          postId: 'post123',
        })
      );

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar mensagem de post curtido', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          usuarioCurtiuId: 'user2',
          autorPostId: 'user1',
        })),
        fields: {
          routingKey: 'notificar.post.curtido',
        } as any,
        properties: {
          headers: {},
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'user1',
          tipo: TipoNotificacao.CURTIDA_POST,
          mensagem: 'Seu post recebeu uma curtida!',
          remetente: 'user2',
          postId: 'post123',
        })
      );

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar mensagem de post moderado (aprovado)', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          aprovado: true,
          categoria: 'RESENHA',
          autorId: 'user1',
        })),
        fields: {
          routingKey: 'notificar.post.moderado',
        } as any,
        properties: {
          headers: {},
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'user1',
          tipo: TipoNotificacao.MODERACAO_POST,
          mensagem: 'Seu post foi aprovado na categoria RESENHA!',
          postId: 'post123',
        })
      );

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve processar mensagem de membro entrou e notificar moderadores', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          userId: 'newUser',
          comunidadeId: 'com123',
          comunidadeNome: 'Comunidade Teste',
          moderadores: ['mod1', 'mod2'],
        })),
        fields: {
          routingKey: 'notificar.membro.entrou',
        } as any,
        properties: {
          headers: {},
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(notificacoesService.criar).toHaveBeenCalledTimes(2);
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'mod1',
          tipo: TipoNotificacao.ENTRAR_COMUNIDADE,
          mensagem: 'Novo membro entrou na comunidade Comunidade Teste!',
          remetente: 'newUser',
        })
      );

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
    });

    it('deve reenfileirar mensagem em caso de erro (retry < 3)', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('DB Error'));

      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          usuarioCurtiuId: 'user2',
          autorPostId: 'user1',
        })),
        fields: {
          routingKey: 'notificar.post.curtido',
        } as any,
        properties: {
          headers: { retryCount: 1 },
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      // Deve rejeitar e recolocar na fila (requeue = true)
      expect(mockChannel.nack).toHaveBeenCalledWith(mensagem, false, true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('deve enviar para DLQ após 3 tentativas', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('DB Error'));

      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({
          postId: 'post123',
          usuarioCurtiuId: 'user2',
          autorPostId: 'user1',
        })),
        fields: {
          routingKey: 'notificar.post.curtido',
        } as any,
        properties: {
          headers: { retryCount: 2 }, // Já é a 3ª tentativa
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      // Deve rejeitar e enviar para DLQ (requeue = false)
      expect(mockChannel.nack).toHaveBeenCalledWith(mensagem, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('deve fazer ACK em mensagem com routing key desconhecida', async () => {
      const mensagem: Partial<ConsumeMessage> = {
        content: Buffer.from(JSON.stringify({})),
        fields: {
          routingKey: 'notificar.tipo.desconhecido',
        } as any,
        properties: {
          headers: {},
        } as any,
      };

      await consumeCallback(mensagem as ConsumeMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mensagem);
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
