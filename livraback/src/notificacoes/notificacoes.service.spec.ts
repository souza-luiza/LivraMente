import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificacoesService, CriarNotificacaoDto } from './notificacoes.service';
import { Notificacao, NotificacaoDocument, TipoNotificacao } from '../schemas/notificacao.schema';

describe('NotificacoesService', () => {
  let service: NotificacoesService;
  let model: jest.Mocked<Model<NotificacaoDocument>>;

  const mockNotificacao = {
    _id: new Types.ObjectId(),
    usuario: new Types.ObjectId(),
    tipo: TipoNotificacao.CURTIDA_POST,
    mensagem: 'Seu post recebeu uma curtida!',
    lida: false,
    remetente: new Types.ObjectId(),
    postId: new Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        _id: new Types.ObjectId(),
        tipo: TipoNotificacao.CURTIDA_POST,
        mensagem: 'Seu post recebeu uma curtida!',
        lida: false,
      }),
    }),
  };

  beforeEach(async () => {
    const mockModel = {
      create: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacoesService,
        {
          provide: getModelToken(Notificacao.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<NotificacoesService>(NotificacoesService);
    model = module.get(getModelToken(Notificacao.name)) as jest.Mocked<Model<NotificacaoDocument>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criar', () => {
    it('deve criar notificação com sucesso', async () => {
      const dto: CriarNotificacaoDto = {
        usuario: '507f1f77bcf86cd799439011',
        tipo: TipoNotificacao.CURTIDA_POST,
        mensagem: 'Seu post recebeu uma curtida!',
        remetente: '507f1f77bcf86cd799439012',
        postId: '507f1f77bcf86cd799439013',
      };

      model.create.mockResolvedValue(mockNotificacao as any);

      const result = await service.criar(dto);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.any(Types.ObjectId),
          tipo: TipoNotificacao.CURTIDA_POST,
          mensagem: 'Seu post recebeu uma curtida!',
          lida: false,
        })
      );

      expect(mockNotificacao.populate).toHaveBeenCalledWith(
        'remetente',
        'username foto_perfil'
      );

      expect(result).toBeDefined();
    });

    it('deve criar notificação sem remetente', async () => {
      const dto: CriarNotificacaoDto = {
        usuario: '507f1f77bcf86cd799439011',
        tipo: TipoNotificacao.SISTEMA,
        mensagem: 'Bem-vindo ao sistema!',
      };

      model.create.mockResolvedValue(mockNotificacao as any);

      await service.criar(dto);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.any(Types.ObjectId),
          remetente: undefined,
        })
      );
    });

    it('deve criar notificação com comunidadeNome', async () => {
      const dto: CriarNotificacaoDto = {
        usuario: '507f1f77bcf86cd799439011',
        tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
        mensagem: 'Novo post em Comunidade Teste',
        comunidadeNome: 'Comunidade Teste',
      };

      model.create.mockResolvedValue(mockNotificacao as any);

      await service.criar(dto);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          comunidadeNome: 'Comunidade Teste',
        })
      );
    });

    it('deve emitir notificação via SSE se cliente estiver registrado', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto: CriarNotificacaoDto = {
        usuario: userId,
        tipo: TipoNotificacao.CURTIDA_POST,
        mensagem: 'Seu post recebeu uma curtida!',
      };

      // Registra cliente SSE
      const subject = service.registrarClienteSSE(userId);
      const nextSpy = jest.spyOn(subject, 'next');

      model.create.mockResolvedValue(mockNotificacao as any);

      await service.criar(dto);

      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('buscarTodas', () => {
    it('deve retornar todas as notificações do usuário ordenadas por data', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockNotificacao]),
      };

      model.find.mockReturnValue(mockChain as any);

      const result = await service.buscarTodas(userId);

      expect(model.find).toHaveBeenCalledWith({
        usuario: expect.any(Types.ObjectId),
      });

      expect(mockChain.populate).toHaveBeenCalledWith(
        'remetente',
        'username foto_perfil'
      );

      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([mockNotificacao]);
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';

      model.updateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      await service.marcarComoLida(notificacaoId, userId);

      expect(model.updateOne).toHaveBeenCalledWith(
        {
          _id: expect.any(Types.ObjectId),
          usuario: expect.any(Types.ObjectId),
        },
        { lida: true }
      );
    });

    it('deve garantir que apenas o dono pode marcar como lida', async () => {
      const notificacaoId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';

      await service.marcarComoLida(notificacaoId, userId);

      const updateCall = model.updateOne.mock.calls[0][0];
      expect(updateCall).toHaveProperty('usuario');
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas as notificações não lidas como lidas', async () => {
      const userId = '507f1f77bcf86cd799439011';

      model.updateMany.mockResolvedValue({ modifiedCount: 5 } as any);

      await service.marcarTodasComoLidas(userId);

      expect(model.updateMany).toHaveBeenCalledWith(
        {
          usuario: expect.any(Types.ObjectId),
          lida: false,
        },
        { lida: true }
      );
    });
  });

  describe('remover', () => {
    it('deve remover notificação do usuário', async () => {
      const notificacaoId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';

      model.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

      await service.remover(notificacaoId, userId);

      expect(model.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        usuario: expect.any(Types.ObjectId),
      });
    });

    it('deve garantir que apenas o dono pode remover', async () => {
      const notificacaoId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';

      await service.remover(notificacaoId, userId);

      const deleteCall = model.deleteOne.mock.calls[0][0];
      expect(deleteCall).toHaveProperty('usuario');
    });
  });

  describe('SSE - registrarClienteSSE', () => {
    it('deve criar novo Subject para usuário', () => {
      const userId = '507f1f77bcf86cd799439011';

      const subject = service.registrarClienteSSE(userId);

      expect(subject).toBeDefined();
      expect(subject.observers).toBeDefined();
    });

    it('deve retornar mesmo Subject para múltiplas chamadas', () => {
      const userId = '507f1f77bcf86cd799439011';

      const subject1 = service.registrarClienteSSE(userId);
      const subject2 = service.registrarClienteSSE(userId);

      expect(subject1).toBe(subject2);
    });
  });

  describe('SSE - removerClienteSSE', () => {
    it('deve completar Subject e remover do Map', () => {
      const userId = '507f1f77bcf86cd799439011';

      const subject = service.registrarClienteSSE(userId);
      const completeSpy = jest.spyOn(subject, 'complete');

      service.removerClienteSSE(userId);

      expect(completeSpy).toHaveBeenCalled();
    });

    it('não deve lançar erro se usuário não tiver Subject', () => {
      expect(() => {
        service.removerClienteSSE('user-nao-existente');
      }).not.toThrow();
    });
  });
});
