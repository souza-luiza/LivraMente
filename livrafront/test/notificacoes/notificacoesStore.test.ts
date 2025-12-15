import { renderHook, act } from '@testing-library/react';
import { useNotificationsStore } from '@/stores/notificacoesStore';
import { Notificacao } from '@/types/notificacao';

describe('notificacoesStore', () => {
    beforeEach(() => {
        const { limparNotificacoes } = useNotificationsStore.getState();
        limparNotificacoes();
    });

    it('deve adicionar uma notificação', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const novaNotificacao: Notificacao = {
            id: '1',
            tipo: 'novo_seguidor',
            mensagem: '@joao começou a te seguir',
            lida: false,
            criadaEm: new Date().toISOString(),
        };

        act(() => {
            result.current.adicionarNotificacao(novaNotificacao);
        });

        expect(result.current.notificacoes).toHaveLength(1);
        expect(result.current.notificacoes[0].mensagem).toBe('@joao começou a te seguir');
    });

    it('deve marcar notificação como lida', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const notificacao: Notificacao = {
            id: '1',
            tipo: 'curtida_post',
            mensagem: 'Alguém curtiu seu post',
            lida: false,
            criadaEm: new Date().toISOString(),
        };

        act(() => {
            result.current.adicionarNotificacao(notificacao);
            result.current.marcarComoLida('1');
        });

        expect(result.current.notificacoes[0].lida).toBe(true);
    });

    it('deve marcar todas como lidas', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const notificacoes: Notificacao[] = [
            {
                id: '1',
                tipo: 'curtida_post',
                mensagem: 'Notificação 1',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
            {
                id: '2',
                tipo: 'comentario_post',
                mensagem: 'Notificação 2',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
        ];

        act(() => {
            result.current.definirNotificacoes(notificacoes);
            result.current.marcarTodasComoLidas();
        });

        expect(result.current.notificacoes.every(n => n.lida)).toBe(true);
    });

    it('deve remover uma notificação', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const notificacao: Notificacao = {
            id: '1',
            tipo: 'mencao',
            mensagem: 'Você foi mencionado',
            lida: false,
            criadaEm: new Date().toISOString(),
        };

        act(() => {
            result.current.adicionarNotificacao(notificacao);
            result.current.removerNotificacao('1');
        });

        expect(result.current.notificacoes).toHaveLength(0);
    });

    it('deve contar notificações não lidas corretamente', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const notificacoes: Notificacao[] = [
            {
                id: '1',
                tipo: 'curtida_post',
                mensagem: 'Notificação 1',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
            {
                id: '2',
                tipo: 'comentario_post',
                mensagem: 'Notificação 2',
                lida: true,
                criadaEm: new Date().toISOString(),
            },
            {
                id: '3',
                tipo: 'mencao',
                mensagem: 'Notificação 3',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
        ];

        act(() => {
            result.current.definirNotificacoes(notificacoes);
        });

        expect(result.current.contarNaoLidas()).toBe(2);
    });

    it('deve limpar todas as notificações', () => {
        const { result } = renderHook(() => useNotificationsStore());
        
        const notificacoes: Notificacao[] = [
            {
                id: '1',
                tipo: 'curtida_post',
                mensagem: 'Notificação 1',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
            {
                id: '2',
                tipo: 'comentario_post',
                mensagem: 'Notificação 2',
                lida: false,
                criadaEm: new Date().toISOString(),
            },
        ];

        act(() => {
            result.current.definirNotificacoes(notificacoes);
            result.current.limparNotificacoes();
        });

        expect(result.current.notificacoes).toHaveLength(0);
    });
});

describe('notificacoesPreferenciasStore', () => {
    let useNotPrefStore: any;

    beforeAll(async () => {
        const module = await import('@/stores/notificacoesStore');
        useNotPrefStore = module.useNotPrefStore;
    });

    beforeEach(() => {
        const state = useNotPrefStore.getState();
        act(() => {
            // Resetar todas as preferências para true
            state.alterarPreferencia('curtidas', true);
            state.alterarPreferencia('comentarios', true);
            state.alterarPreferencia('mencoes', true);
            state.alterarPreferencia('novosSeguidores', true);
        });
    });

    it('deve ter todas as preferências ativadas por padrão', () => {
        const { result } = renderHook(() => useNotPrefStore());

        expect(result.current.preferencias.curtidas).toBe(true);
        expect(result.current.preferencias.comentarios).toBe(true);
        expect(result.current.preferencias.mencoes).toBe(true);
        expect(result.current.preferencias.novosSeguidores).toBe(true);
    });

    it('deve alterar preferência de curtidas', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('curtidas', false);
        });

        expect(result.current.preferencias.curtidas).toBe(false);
        expect(result.current.preferencias.comentarios).toBe(true);
    });

    it('deve verificar se deve notificar para tipo mapeado (curtida_post)', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('curtidas', false);
        });

        expect(result.current.deveNotificar('curtida_post')).toBe(false);
    });

    it('deve verificar se deve notificar para tipo mapeado (curtida_resenha)', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('curtidas', false);
        });

        expect(result.current.deveNotificar('curtida_resenha')).toBe(false);
    });

    it('deve verificar se deve notificar para comentários', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('comentarios', false);
        });

        expect(result.current.deveNotificar('comentario_post')).toBe(false);
        expect(result.current.deveNotificar('comentario_resenha')).toBe(false);
        expect(result.current.deveNotificar('resposta_comentario')).toBe(false);
    });

    it('deve verificar se deve notificar para menções', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('mencoes', false);
        });

        expect(result.current.deveNotificar('mencao')).toBe(false);
    });

    it('deve verificar se deve notificar para novos seguidores', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('novosSeguidores', false);
        });

        expect(result.current.deveNotificar('novo_seguidor')).toBe(false);
    });

    it('deve sempre retornar true para tipos não mapeados (notificações de sistema)', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            // Desabilitar todas as preferências
            result.current.alterarPreferencia('curtidas', false);
            result.current.alterarPreferencia('comentarios', false);
            result.current.alterarPreferencia('mencoes', false);
            result.current.alterarPreferencia('novosSeguidores', false);
        });

        // Tipos não mapeados (ex: notificações de sistema) sempre devem notificar
        expect(result.current.deveNotificar('notificacao_sistema')).toBe(true);
        expect(result.current.deveNotificar('alerta_moderacao')).toBe(true);
        expect(result.current.deveNotificar('tipo_desconhecido')).toBe(true);
    });

    it('deve permitir múltiplas alterações de preferências', () => {
        const { result } = renderHook(() => useNotPrefStore());

        act(() => {
            result.current.alterarPreferencia('curtidas', false);
            result.current.alterarPreferencia('mencoes', false);
        });

        expect(result.current.preferencias.curtidas).toBe(false);
        expect(result.current.preferencias.comentarios).toBe(true);
        expect(result.current.preferencias.mencoes).toBe(false);
        expect(result.current.preferencias.novosSeguidores).toBe(true);
    });
});
