import { Test, TestingModule } from '@nestjs/testing';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { TipoNotificacao } from '../schemas/notificacao.schema';
import { Subject } from 'rxjs';
import { Types } from 'mongoose';

describe('NotificacoesController', () => {
  let controller: NotificacoesController;
  let service: jest.Mocked<NotificacoesService>;

  const mockRequest = {
    session: {
      userId: '507f1f77bcf86cd799439011',
    },
  };

  const mockNotificacao = {
    _id: new Types.ObjectId(),
    usuario: new Types.ObjectId(),
    tipo: TipoNotificacao.CURTIDA_POST,
    mensagem: 'Seu post recebeu uma curtida!',
    lida: false,
    createdAt: new Date(),
    remetente: {
      _id: new Types.ObjectId(),
      username: 'user123',
      foto_perfil: 'avatar.jpg',
    },
  };

  const mockNotificacoesService = {
    buscarTodas: jest.fn(),
    marcarComoLida: jest.fn(),
    marcarTodasComoLidas: jest.fn(),
    remover: jest.fn(),
    registrarClienteSSE: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacoesController],
      providers: [
        {
          provide: NotificacoesService,
          useValue: mockNotificacoesService,
        },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<NotificacoesController>(NotificacoesController);
    service = module.get(NotificacoesService) as jest.Mocked<NotificacoesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('buscarTodas', () => {
    it('deve retornar todas as notificações do usuário', async () => {
      const notificacoes = [mockNotificacao];
      service.buscarTodas.mockResolvedValue(notificacoes as any);

      const result = await controller.buscarTodas(mockRequest);

      expect(service.buscarTodas).toHaveBeenCalledWith(mockRequest.session.userId);
      expect(result).toEqual(notificacoes);
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoId = '507f1f77bcf86cd799439012';

      service.marcarComoLida.mockResolvedValue(undefined);

      const result = await controller.marcarComoLida(mockRequest, notificacaoId);

      expect(service.marcarComoLida).toHaveBeenCalledWith(
        notificacaoId,
        mockRequest.session.userId
      );
      expect(result).toEqual({ message: 'Notificação marcada como lida' });
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas as notificações como lidas', async () => {
      service.marcarTodasComoLidas.mockResolvedValue(undefined);

      const result = await controller.marcarTodasComoLidas(mockRequest);

      expect(service.marcarTodasComoLidas).toHaveBeenCalledWith(
        mockRequest.session.userId
      );
      expect(result).toEqual({ message: 'Todas as notificações marcadas como lidas' });
    });
  });

  describe('remover', () => {
    it('deve remover notificação', async () => {
      const notificacaoId = '507f1f77bcf86cd799439012';

      service.remover.mockResolvedValue(undefined);

      const result = await controller.remover(mockRequest, notificacaoId);

      expect(service.remover).toHaveBeenCalledWith(
        notificacaoId,
        mockRequest.session.userId
      );
      expect(result).toEqual({ message: 'Notificação removida' });
    });
  });

  describe('streamNotificacoes (SSE)', () => {
    it('deve retornar Observable de MessageEvent', (done) => {
      const subject = new Subject();
      service.registrarClienteSSE.mockReturnValue(subject as any);

      const observable = controller.streamNotificacoes(mockRequest);

      expect(service.registrarClienteSSE).toHaveBeenCalledWith(
        mockRequest.session.userId
      );

      expect(observable).toBeDefined();

      // Testa se o Observable emite corretamente
      const subscription = observable.subscribe({
        next: (event) => {
          expect(event).toHaveProperty('data');
          const parsedData = JSON.parse(event.data);
          expect(parsedData).toHaveProperty('tipo');
          expect(parsedData).toHaveProperty('mensagem');
          subscription.unsubscribe();
          done();
        },
      });

      // Emite uma notificação
      subject.next(mockNotificacao);
    });

    it('deve formatar MessageEvent corretamente', (done) => {
      const subject = new Subject();
      service.registrarClienteSSE.mockReturnValue(subject as any);

      const observable = controller.streamNotificacoes(mockRequest);

      observable.subscribe({
        next: (event) => {
          const parsedData = JSON.parse(event.data);
          
          expect(parsedData).toEqual({
            id: mockNotificacao._id.toString(),
            tipo: mockNotificacao.tipo,
            mensagem: mockNotificacao.mensagem,
            lida: mockNotificacao.lida,
            criadaEm: mockNotificacao.createdAt.toISOString(),
            remetente: {
              id: mockNotificacao.remetente._id.toString(),
              username: mockNotificacao.remetente.username,
              foto_perfil: mockNotificacao.remetente.foto_perfil,
            },
          });
          
          done();
        },
      });

      subject.next(mockNotificacao);
    });

    it('deve lidar com notificação sem remetente', (done) => {
      const subject = new Subject();
      service.registrarClienteSSE.mockReturnValue(subject as any);

      const notificacaoSemRemetente = {
        ...mockNotificacao,
        remetente: undefined,
      };

      const observable = controller.streamNotificacoes(mockRequest);

      observable.subscribe({
        next: (event) => {
          const parsedData = JSON.parse(event.data);
          expect(parsedData.remetente).toBeUndefined();
          done();
        },
      });

      subject.next(notificacaoSemRemetente);
    });
  });
});
