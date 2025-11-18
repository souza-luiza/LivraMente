import { getNotificacoes, marcarNotificacaoComoLida, marcarTodasComoLidas, removerNotificacao, conectarNotificacoes } from '@/services/mensageria';
import { Notificacao } from '@/types/notificacao';

global.fetch = jest.fn();

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do EventSource
const mockEventSourceInstances: any[] = [];

class MockEventSource {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    close = jest.fn();
    
    constructor(public url: string) {
        mockEventSourceInstances.push(this);
    }
    
    simulateMessage(data: any) {
        if (this.onmessage) {
            this.onmessage({ data: JSON.stringify(data) } as MessageEvent);
        }
    }
    
    simulateError() {
        if (this.onerror) {
            this.onerror(new Event('error'));
        }
    }
}

(global as any).EventSource = MockEventSource;

describe('Mensageria Service', () => {
    const mockNotificacoes: Notificacao[] = [
        {
            id: '1',
            tipo: 'novo_seguidor',
            mensagem: '@joao começou a te seguir',
            lida: false,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-1',
                username: 'joao',
            },
        },
        {
            id: '2',
            tipo: 'curtida_post',
            mensagem: '@maria curtiu seu post',
            lida: true,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-2',
                username: 'maria',
            },
            postId: 'post-123'
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        mockEventSourceInstances.length = 0;
    });

    describe('getNotificacoes', () => {
        it('deve buscar notificações com sucesso', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockNotificacoes,
            });

            const result = await getNotificacoes();

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/notificacoes',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
            expect(result).toEqual(mockNotificacoes);
        });

        it('deve lançar erro quando a requisição falha', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            await expect(getNotificacoes()).rejects.toThrow('Erro ao buscar notificações');
        });

    });

    describe('marcarNotificacaoComoLida', () => {
        it('deve marcar notificação como lida com sucesso', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            });

            await marcarNotificacaoComoLida('123');

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/notificacoes/123/lida',
                expect.objectContaining({
                    method: 'PATCH',
                    credentials: 'include'
                })
            );
        });

        it('deve lançar erro quando falha', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            await expect(marcarNotificacaoComoLida('123')).rejects.toThrow('Erro ao marcar notificação como lida');
        });
    });

    describe('marcarTodasComoLidas', () => {
        it('deve marcar todas as notificações como lidas', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            });

            await marcarTodasComoLidas();

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/notificacoes/marcar-todas-lidas',
                expect.objectContaining({
                    method: 'PATCH',
                })
            );
        });

        it('deve lançar erro quando falha', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            await expect(marcarTodasComoLidas()).rejects.toThrow('Erro ao marcar todas as notificações como lidas');
        });
    });

    describe('removerNotificacao', () => {
        it('deve remover notificação com sucesso', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            });

            await removerNotificacao('123');

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/notificacoes/123',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        it('deve lançar erro quando falha', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            await expect(removerNotificacao('123')).rejects.toThrow('Erro ao remover notificação');
        });
    });

    describe('conectarNotificacoes (SSE)', () => {
        it('deve conectar ao SSE e receber notificações', () => {
            const onNotificacao = jest.fn();
            const onError = jest.fn();

            const desconectar = conectarNotificacoes(onNotificacao, onError);

            // Simular chegada de nova notificação
            const mockEventSource = mockEventSourceInstances[0];
            mockEventSource.simulateMessage(mockNotificacoes[0]);

            expect(onNotificacao).toHaveBeenCalledWith(mockNotificacoes[0]);

            // Limpar
            desconectar();
            expect(mockEventSource.close).toHaveBeenCalled();
        });

        it('deve chamar callback de erro quando conexão falha', () => {
            const onNotificacao = jest.fn();
            const onError = jest.fn();

            conectarNotificacoes(onNotificacao, onError);

            const mockEventSource = mockEventSourceInstances[0];
            mockEventSource.simulateError();

            expect(onError).toHaveBeenCalled();
        });

        it('deve conectar ao SSE sem token na URL', () => {
            const onNotificacao = jest.fn();
            const onError = jest.fn();

            conectarNotificacoes(onNotificacao, onError);

            const mockEventSource = mockEventSourceInstances[0];
            expect(mockEventSource.url).toBe('http://localhost:3001/notificacoes/stream');
        });

        it('deve permitir desconexão', () => {
            const onNotificacao = jest.fn();
            const onError = jest.fn();

            const desconectar = conectarNotificacoes(onNotificacao, onError);
            const mockEventSource = mockEventSourceInstances[0];

            desconectar();

            expect(mockEventSource.close).toHaveBeenCalled();
        });

        it('deve chamar onError quando JSON inválido for recebido', () => {
            const onNotificacao = jest.fn();
            const onError = jest.fn();

            conectarNotificacoes(onNotificacao, onError);

            const mockEventSource = mockEventSourceInstances[0];
            
            // Simular mensagem com JSON inválido
            if (mockEventSource.onmessage) {
                mockEventSource.onmessage({ data: 'JSON inválido {{{' } as MessageEvent);
            }

            expect(onError).toHaveBeenCalled();
            expect(onNotificacao).not.toHaveBeenCalled();
        });
    });
});