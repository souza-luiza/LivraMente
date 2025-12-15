import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificacoesConsumer } from './notificacoes.consumer';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { ComunidadesService } from '../../comunidades/comunidades.service';
import { FILAS, ROUTING_KEYS } from '../queue.constants';
import { TipoNotificacao } from '../../schemas/notificacao.schema';
import { PostCriadoEventDto, PostCurtidoEventDto, PostModeradoEventDto, MembroEntrouEventDto, ComentarioCriadoEventDto, ComentarioCurtidoEventDto } from '../dto';

describe('NotificacoesConsumer', () => {
  let consumer: NotificacoesConsumer;
  let notificacoesService: jest.Mocked<NotificacoesService>;
  let comunidadesService: jest.Mocked<ComunidadesService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    notificacoesService = {
      criar: jest.fn().mockResolvedValue({}),
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

  describe('notificarPostCriado', () => {
    const mockComunidade = {
      _id: 'com123',
      nome: 'Comunidade Teste',
      membros: ['membro1', 'membro2', 'autor123'],
      moderadores: ['mod1'],
    };

    beforeEach(() => {
      comunidadesService.findById.mockResolvedValue(mockComunidade as any);
    });

    it('deve notificar todos os membros exceto o autor do post', async () => {
      const dados: PostCriadoEventDto = {
        postId: 'post123',
        autorId: 'autor123',
        comunidadeId: 'com123',
        conteudo: 'Conteúdo do post de teste para a comunidade',
      };

      await (consumer as any).notificarPostCriado(dados);

      expect(comunidadesService.findById).toHaveBeenCalledWith('com123');
      // Deve criar notificação para membro1 e membro2, mas não para autor123
      expect(notificacoesService.criar).toHaveBeenCalledTimes(2);
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'membro1',
          tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
          remetente: 'autor123',
          postId: 'post123',
        })
      );
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'membro2',
          tipo: TipoNotificacao.NOVO_POST_COMUNIDADE,
        })
      );
    });

    it('deve lançar erro se comunidadesService falhar', async () => {
      comunidadesService.findById.mockRejectedValue(new Error('Comunidade não encontrada'));

      const dados: PostCriadoEventDto = {
        postId: 'post123',
        autorId: 'autor123',
        comunidadeId: 'com-inexistente',
        conteudo: 'Teste',
      };

      await expect((consumer as any).notificarPostCriado(dados)).rejects.toThrow('Comunidade não encontrada');
    });

    it('deve lançar erro se notificacoesService.criar falhar', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('Erro ao criar notificação'));

      const dados: PostCriadoEventDto = {
        postId: 'post123',
        autorId: 'autor123',
        comunidadeId: 'com123',
        conteudo: 'Teste',
      };

      await expect((consumer as any).notificarPostCriado(dados)).rejects.toThrow('Erro ao criar notificação');
    });
  });

  describe('notificarPostCurtido', () => {
    it('deve criar notificação de curtida para o autor do post', async () => {
      const dados: PostCurtidoEventDto = {
        postId: 'post123',
        userId: 'user456',
        autorId: 'autor123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarPostCurtido(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith({
        usuario: 'autor123',
        tipo: TipoNotificacao.CURTIDA_POST,
        mensagem: 'Seu post foi curtido!',
        remetente: 'user456',
        postId: 'post123',
        comunidadeNome: 'Comunidade Teste',
      });
    });

    it('não deve criar notificação se o usuário curtir o próprio post', async () => {
      const dados: PostCurtidoEventDto = {
        postId: 'post123',
        userId: 'autor123',
        autorId: 'autor123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarPostCurtido(dados);

      expect(notificacoesService.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se notificacoesService.criar falhar', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('Erro ao criar'));

      const dados: PostCurtidoEventDto = {
        postId: 'post123',
        userId: 'user456',
        autorId: 'autor123',
        comunidadeNome: 'Teste',
      };

      await expect((consumer as any).notificarPostCurtido(dados)).rejects.toThrow('Erro ao criar');
    });
  });

  describe('notificarPostModerado', () => {
    it('deve criar notificação de aprovação quando post é aprovado', async () => {
      const dados: PostModeradoEventDto = {
        postId: 'post123',
        aprovado: true,
        categoria: 'Ficção',
        autorId: 'autor123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarPostModerado(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith({
        usuario: 'autor123',
        tipo: TipoNotificacao.MODERACAO_POST,
        mensagem: 'Seu post foi aprovado na categoria Ficção!',
        postId: 'post123',
        comunidadeNome: 'Comunidade Teste',
      });
    });

    it('deve criar notificação de rejeição quando post é rejeitado', async () => {
      const dados: PostModeradoEventDto = {
        postId: 'post123',
        aprovado: false,
        categoria: 'Spam',
        autorId: 'autor123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarPostModerado(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith({
        usuario: 'autor123',
        tipo: TipoNotificacao.MODERACAO_POST,
        mensagem: 'Seu post foi rejeitado pela moderação.',
        postId: 'post123',
        comunidadeNome: 'Comunidade Teste',
      });
    });

    it('deve lançar erro se notificacoesService.criar falhar', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('Erro de banco'));

      const dados: PostModeradoEventDto = {
        postId: 'post123',
        aprovado: true,
        categoria: 'Ficção',
        autorId: 'autor123',
        comunidadeNome: 'Teste',
      };

      await expect((consumer as any).notificarPostModerado(dados)).rejects.toThrow('Erro de banco');
    });
  });

  describe('notificarMembroEntrou', () => {
    const mockComunidade = {
      _id: 'com123',
      nome: 'Comunidade Teste',
      membros: ['membro1', 'user456'],
      moderadores: ['mod1', 'mod2', 'user456'],
    };

    beforeEach(() => {
      comunidadesService.findById.mockResolvedValue(mockComunidade as any);
    });

    it('deve notificar todos os moderadores exceto o novo membro', async () => {
      const dados: MembroEntrouEventDto = {
        userId: 'user456',
        comunidadeId: 'com123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarMembroEntrou(dados);

      expect(comunidadesService.findById).toHaveBeenCalledWith('com123');
      // Deve notificar mod1 e mod2, mas não user456 (é o próprio usuário)
      expect(notificacoesService.criar).toHaveBeenCalledTimes(2);
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'mod1',
          tipo: TipoNotificacao.ENTRAR_COMUNIDADE,
          remetente: 'user456',
        })
      );
      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'mod2',
          tipo: TipoNotificacao.ENTRAR_COMUNIDADE,
        })
      );
    });

    it('deve lançar erro se comunidadesService falhar', async () => {
      comunidadesService.findById.mockRejectedValue(new Error('Erro ao buscar comunidade'));

      const dados: MembroEntrouEventDto = {
        userId: 'user456',
        comunidadeId: 'com-inexistente',
        comunidadeNome: 'Teste',
      };

      await expect((consumer as any).notificarMembroEntrou(dados)).rejects.toThrow('Erro ao buscar comunidade');
    });
  });

  describe('notificarComentarioCriado', () => {
    it('deve criar notificação para o autor do post', async () => {
      const dados: ComentarioCriadoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        autorComentarioId: 'user456',
        autorPostId: 'autor123',
        conteudo: 'Este é um comentário de teste muito interessante',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarComentarioCriado(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith({
        usuario: 'autor123',
        tipo: TipoNotificacao.COMENTARIO_POST,
        mensagem: 'Novo comentário no seu post: "Este é um comentário de teste muito interessante"',
        remetente: 'user456',
        postId: 'post123',
        comentarioId: 'comment123',
        comunidadeNome: 'Comunidade Teste',
      });
    });

    it('deve truncar conteúdo longo com reticências', async () => {
      const conteudoLongo = 'A'.repeat(100);
      const dados: ComentarioCriadoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        autorComentarioId: 'user456',
        autorPostId: 'autor123',
        conteudo: conteudoLongo,
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarComentarioCriado(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: expect.stringContaining('...'),
        })
      );
    });

    it('não deve criar notificação se o autor do comentário é o autor do post', async () => {
      const dados: ComentarioCriadoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        autorComentarioId: 'autor123',
        autorPostId: 'autor123',
        conteudo: 'Auto-comentário',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarComentarioCriado(dados);

      expect(notificacoesService.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se notificacoesService.criar falhar', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('Erro no serviço'));

      const dados: ComentarioCriadoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        autorComentarioId: 'user456',
        autorPostId: 'autor123',
        conteudo: 'Teste',
        comunidadeNome: 'Comunidade',
      };

      await expect((consumer as any).notificarComentarioCriado(dados)).rejects.toThrow('Erro no serviço');
    });
  });

  describe('notificarComentarioCurtido', () => {
    it('deve criar notificação de curtida para o autor do comentário', async () => {
      const dados: ComentarioCurtidoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        userId: 'user456',
        autorId: 'autorComentario123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarComentarioCurtido(dados);

      expect(notificacoesService.criar).toHaveBeenCalledWith({
        usuario: 'autorComentario123',
        tipo: TipoNotificacao.CURTIDA_COMENTARIO,
        mensagem: 'Seu comentário foi curtido!',
        remetente: 'user456',
        postId: 'post123',
        comentarioId: 'comment123',
        comunidadeNome: 'Comunidade Teste',
      });
    });

    it('não deve criar notificação se o usuário curtir o próprio comentário', async () => {
      const dados: ComentarioCurtidoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        userId: 'autor123',
        autorId: 'autor123',
        comunidadeNome: 'Comunidade Teste',
      };

      await (consumer as any).notificarComentarioCurtido(dados);

      expect(notificacoesService.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se notificacoesService.criar falhar', async () => {
      notificacoesService.criar.mockRejectedValue(new Error('Falha ao salvar'));

      const dados: ComentarioCurtidoEventDto = {
        comentarioId: 'comment123',
        postId: 'post123',
        userId: 'user456',
        autorId: 'autor123',
        comunidadeNome: 'Teste',
      };

      await expect((consumer as any).notificarComentarioCurtido(dados)).rejects.toThrow('Falha ao salvar');
    });
  });
});
