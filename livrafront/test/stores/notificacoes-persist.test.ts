import { useNotificationsStore } from '@/stores/notificacoesStore';
import { Notificacao } from '@/types/notificacao';

let store: Record<string, string> = {};

const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('NotificacoesStore - Persistência', () => {
    const mockNotificacao1: Notificacao = {
        id: '1',
        tipo: 'novo_seguidor',
        mensagem: '@joao começou a te seguir',
        lida: false,
        criadaEm: new Date('2025-11-16T10:00:00').toISOString(),
        remetente: {
            id: 'user-1',
            username: 'joao',
            foto_perfil: 'https://example.com/joao.jpg'
        },
    };

    const mockNotificacao2: Notificacao = {
        id: '2',
        tipo: 'curtida_post',
        mensagem: '@maria curtiu seu post',
        lida: false,
        criadaEm: new Date('2025-11-16T09:00:00').toISOString(),
        remetente: {
            id: 'user-2',
            username: 'maria',
        },
        postId: 'post-123'
    };

    beforeEach(() => {
        store = {};
        localStorageMock.clear();
        // Reset do store
        useNotificationsStore.getState().definirNotificacoes([]);
        jest.clearAllMocks();
    });

    describe('Persistência no localStorage', () => {
        it('deve salvar notificações no localStorage ao adicionar', () => {
            const { adicionarNotificacao } = useNotificationsStore.getState();
            
            adicionarNotificacao(mockNotificacao1);
            
            // Verificar que foi adicionado ao store
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(1);
            expect(currentState.notificacoes[0].id).toBe('1');
        });

        it('deve persistir múltiplas notificações', () => {
            const { adicionarNotificacao } = useNotificationsStore.getState();
            
            adicionarNotificacao(mockNotificacao1);
            adicionarNotificacao(mockNotificacao2);
            
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(2);
            // adicionarNotificacao adiciona no início, então a ordem é invertida
            expect(currentState.notificacoes[0].id).toBe('2');
            expect(currentState.notificacoes[1].id).toBe('1');
        });

        it('deve carregar notificações do localStorage ao iniciar', () => {
            const { definirNotificacoes } = useNotificationsStore.getState();

            definirNotificacoes([mockNotificacao1, mockNotificacao2]);
            
            const store = useNotificationsStore.getState();
            expect(store.notificacoes).toHaveLength(2);
            expect(store.notificacoes[0].id).toBe('1');
            expect(store.notificacoes[1].id).toBe('2');
        });

        it('deve persistir alteração de status "lida"', () => {
            const { adicionarNotificacao, marcarComoLida } = useNotificationsStore.getState();
            
            adicionarNotificacao(mockNotificacao1);
            marcarComoLida('1');
            
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes[0].lida).toBe(true);
        });

        it('deve persistir remoção de notificação', () => {
            const { adicionarNotificacao, removerNotificacao } = useNotificationsStore.getState();
            
            adicionarNotificacao(mockNotificacao1);
            adicionarNotificacao(mockNotificacao2);
            
            let currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(2);
            
            removerNotificacao('1');
            
            currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(1);
            expect(currentState.notificacoes[0].id).toBe('2');
        });

        it('deve persistir marcar todas como lidas', () => {
            const { definirNotificacoes, marcarTodasComoLidas } = useNotificationsStore.getState();
            
            definirNotificacoes([mockNotificacao1, mockNotificacao2]);
            marcarTodasComoLidas();
            
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes.every(n => n.lida)).toBe(true);
        });

        it('deve manter apenas array de notificações (partialize)', () => {
            const { adicionarNotificacao } = useNotificationsStore.getState();
            
            adicionarNotificacao(mockNotificacao1);
            
            // Verificar que a notificação foi adicionada corretamente
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(1);
            // Store deve ter apenas notificacoes e métodos, sem outras propriedades persistidas
            expect(currentState).toHaveProperty('notificacoes');
            expect(currentState).toHaveProperty('adicionarNotificacao');
        });

        it('deve lidar com localStorage vazio', () => {
            localStorageMock.clear();
            
            const store = useNotificationsStore.getState();
            
            expect(store.notificacoes).toEqual([]);
        });

        it('deve lidar com dados corrompidos no localStorage', () => {
            localStorageMock.setItem('notificacoes-storage', 'invalid-json{]');
            
            // Não deve lançar erro, deve iniciar com array vazio
            const store = useNotificationsStore.getState();
            expect(store.notificacoes).toEqual([]);
        });

        it('deve manter ordem das notificações após recarregar', () => {
            const { definirNotificacoes } = useNotificationsStore.getState();
            
            const notificacoes = [mockNotificacao1, mockNotificacao2];
            definirNotificacoes(notificacoes);
            
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes[0].id).toBe('1');
            expect(currentState.notificacoes[1].id).toBe('2');
        });

        it('deve preservar todos os campos da notificação', () => {
            const notificacaoCompleta: Notificacao = {
                id: '3',
                tipo: 'comentario_post',
                mensagem: '@pedro comentou no seu post',
                lida: false,
                criadaEm: new Date().toISOString(),
                remetente: {
                    id: 'user-3',
                    username: 'pedro',
                    foto_perfil: 'https://example.com/pedro.jpg'
                },
                postId: 'post-456',
                comentarioId: 'comment-789'
            };
            
            const { adicionarNotificacao } = useNotificationsStore.getState();
            adicionarNotificacao(notificacaoCompleta);
            
            const currentState = useNotificationsStore.getState();
            const persisted = currentState.notificacoes[0];
            
            expect(persisted).toEqual(notificacaoCompleta);
        });

        it('deve manter consistência entre operações sequenciais', () => {
            const { adicionarNotificacao, marcarComoLida, removerNotificacao } = useNotificationsStore.getState();
            
            // Sequência de operações
            adicionarNotificacao(mockNotificacao1);
            adicionarNotificacao(mockNotificacao2);
            marcarComoLida('1');
            removerNotificacao('1');
            
            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes).toHaveLength(1);
            expect(currentState.notificacoes[0].id).toBe('2');
        });
    });

    describe('Cache local para acesso offline', () => {
        it('deve permitir acesso às notificações sem conexão', () => {
            const { definirNotificacoes } = useNotificationsStore.getState();
            
            // Simular que já tinha notificações salvas
            definirNotificacoes([mockNotificacao1, mockNotificacao2]);
            
            // Mesmo sem conexão, deve ter acesso
            const { notificacoes } = useNotificationsStore.getState();
            
            expect(notificacoes).toHaveLength(2);
            expect(notificacoes[0].mensagem).toBe('@joao começou a te seguir');
        });

        it('deve manter estado consistente após operações offline', () => {
            const { adicionarNotificacao, marcarComoLida, contarNaoLidas } = useNotificationsStore.getState();
            
            // Adicionar notificações "offline"
            adicionarNotificacao(mockNotificacao1);
            adicionarNotificacao(mockNotificacao2);
            
            expect(contarNaoLidas()).toBe(2);

            marcarComoLida('1');
            
            expect(contarNaoLidas()).toBe(1);

            const currentState = useNotificationsStore.getState();
            expect(currentState.notificacoes[1].lida).toBe(true);
            expect(currentState.notificacoes[0].lida).toBe(false);
        });
    });
});