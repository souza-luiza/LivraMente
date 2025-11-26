import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificacoesConsumer } from './notificacoes.consumer';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { ComunidadesService } from '../../comunidades/comunidades.service';
import { FILAS, ROUTING_KEYS } from '../queue.constants';
import { PostCriadoEventDto, PostCurtidoEventDto, PostModeradoEventDto, MembroEntrouEventDto, ComentarioCriadoEventDto, ComentarioCurtidoEventDto } from '../dto';

describe('NotificacoesConsumer', () => {
  let consumer: NotificacoesConsumer;
  let notificacoesService: jest.Mocked<NotificacoesService>;
  let comunidadesService: jest.Mocked<ComunidadesService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    notificacoesService = {
      criar: jest.fn(),
    } as any;
    comunidadesService = {
      findById: jest.fn(),
    } as any;
    configService = {
      get: jest.fn(),
      getOrThrow: jest.fn().mockReturnValue('amqp://localhost:5672'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacoesConsumer,
        { provide: NotificacoesService, useValue: notificacoesService },
        { provide: ComunidadesService, useValue: comunidadesService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    consumer = module.get<NotificacoesConsumer>(NotificacoesConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('getQueueName deve retornar o nome da fila correta', () => {
    expect(consumer["getQueueName"]()).toBe(FILAS.ENVIAR_NOTIFICACOES);
  });

  it('getPrefetchCount deve retornar 1', () => {
    expect(consumer["getPrefetchCount"]()).toBe(1);
  });

  describe('processar', () => {
    it('deve chamar notificarPostCriado para routingKey NOTIFICAR_POST_CRIADO', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarPostCriado').mockResolvedValue(undefined);
      await (consumer as any).processar({} as PostCriadoEventDto, ROUTING_KEYS.NOTIFICAR_POST_CRIADO);
      expect(spy).toHaveBeenCalled();
    });
    it('deve chamar notificarPostCurtido para routingKey NOTIFICAR_POST_CURTIDO', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarPostCurtido').mockResolvedValue(undefined);
      await (consumer as any).processar({} as PostCurtidoEventDto, ROUTING_KEYS.NOTIFICAR_POST_CURTIDO);
      expect(spy).toHaveBeenCalled();
    });
    it('deve chamar notificarPostModerado para routingKey NOTIFICAR_POST_MODERADO', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarPostModerado').mockResolvedValue(undefined);
      await (consumer as any).processar({} as PostModeradoEventDto, ROUTING_KEYS.NOTIFICAR_POST_MODERADO);
      expect(spy).toHaveBeenCalled();
    });
    it('deve chamar notificarMembroEntrou para routingKey NOTIFICAR_MEMBRO_ENTROU', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarMembroEntrou').mockResolvedValue(undefined);
      await (consumer as any).processar({} as MembroEntrouEventDto, ROUTING_KEYS.NOTIFICAR_MEMBRO_ENTROU);
      expect(spy).toHaveBeenCalled();
    });
    it('deve chamar notificarComentarioCriado para routingKey NOTIFICAR_COMENTARIO_CRIADO', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarComentarioCriado').mockResolvedValue(undefined);
      await (consumer as any).processar({} as ComentarioCriadoEventDto, ROUTING_KEYS.NOTIFICAR_COMENTARIO_CRIADO);
      expect(spy).toHaveBeenCalled();
    });
    it('deve chamar notificarComentarioCurtido para routingKey NOTIFICAR_COMENTARIO_CURTIDO', async () => {
      const spy = jest.spyOn<any, any>(consumer as any, 'notificarComentarioCurtido').mockResolvedValue(undefined);
      await (consumer as any).processar({} as ComentarioCurtidoEventDto, ROUTING_KEYS.NOTIFICAR_COMENTARIO_CURTIDO);
      expect(spy).toHaveBeenCalled();
    });
    it('deve logar warning para routingKey desconhecida', async () => {
      const loggerWarn = jest.spyOn((consumer as any).logger, 'warn').mockImplementation();
      await (consumer as any).processar({}, 'ROTA_DESCONHECIDA');
      expect(loggerWarn).toHaveBeenCalledWith(expect.stringContaining('Tipo de notificação não tratado'));
    });
  });
});
