import { renderHook, waitFor } from '@testing-library/react';
import { useNotificacoes, useSolicitaPermissao } from '@/hooks/useNotificacoes';
import { useNotificationsStore, useNotPrefStore } from '@/stores/notificacoesStore';
import * as mensageriaService from '@/services/mensageria';
import { Notificacao } from '@/types/notificacao';

// Mock dos módulos
jest.mock('@/stores/notificacoesStore', () => ({
    useNotificationsStore: jest.fn(),
    useNotPrefStore: jest.fn(),
}));
jest.mock('@/services/mensageria');
jest.mock('react-toastify');

// Mock do Notification API
const mockNotification = jest.fn();
const mockRequestPermission = jest.fn();
(global as any).Notification = mockNotification;
(global as any).Notification.permission = 'granted';
(global as any).Notification.requestPermission = mockRequestPermission;

describe('useNotificacoes Hook', () => {
    const mockAdicionarNotificacao = jest.fn();
    const mockDefinirNotificacoes = jest.fn();
    const mockDesconectar = jest.fn();

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

        // Mock do store de notificações
        (useNotificationsStore as unknown as jest.Mock).mockReturnValue({
            adicionarNotificacao: mockAdicionarNotificacao,
            definirNotificacoes: mockDefinirNotificacoes,
        });

        // Mock do store de preferências
        (useNotPrefStore as unknown as jest.Mock).mockReturnValue({
            deveNotificar: jest.fn().mockReturnValue(true),
        });

        // Mock das funções de serviço
        (mensageriaService.getNotificacoes as jest.Mock).mockResolvedValue(mockNotificacoes);
        (mensageriaService.conectarNotificacoes as jest.Mock).mockReturnValue(mockDesconectar);
    });

    it('deve carregar notificações ao montar', async () => {
        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(mensageriaService.getNotificacoes).toHaveBeenCalled();
            expect(mockDefinirNotificacoes).toHaveBeenCalledWith(mockNotificacoes);
        });
    });

    it('deve conectar ao SSE ao montar', async () => {
        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(mensageriaService.conectarNotificacoes).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it('deve adicionar nova notificação quando recebida via SSE', async () => {
        let onNotificacaoCallback: ((notificacao: Notificacao) => void) | null = null;

        (mensageriaService.conectarNotificacoes as jest.Mock).mockImplementation(
            (onNotificacao: (n: Notificacao) => void) => {
                onNotificacaoCallback = onNotificacao;
                return mockDesconectar;
            }
        );

        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(onNotificacaoCallback).not.toBeNull();
        });

        // Simular chegada de nova notificação
        const novaNotificacao: Notificacao = {
            id: '3',
            tipo: 'comentario_post',
            mensagem: '@pedro comentou seu post',
            lida: false,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-3',
                username: 'pedro',
            },
            postId: 'post-456'
        };

        onNotificacaoCallback!(novaNotificacao);

        expect(mockAdicionarNotificacao).toHaveBeenCalledWith(novaNotificacao);
    });

    it('deve criar notificação do navegador quando permitido', async () => {
        let onNotificacaoCallback: ((notificacao: Notificacao) => void) | null = null;

        (mensageriaService.conectarNotificacoes as jest.Mock).mockImplementation(
            (onNotificacao: (n: Notificacao) => void) => {
                onNotificacaoCallback = onNotificacao;
                return mockDesconectar;
            }
        );

        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(onNotificacaoCallback).not.toBeNull();
        });

        const novaNotificacao: Notificacao = {
            id: '3',
            tipo: 'mencao',
            mensagem: '@ana mencionou você',
            lida: false,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-4',
                username: 'ana',
            },
        };

        onNotificacaoCallback!(novaNotificacao);

        expect(mockNotification).toHaveBeenCalledWith('Nova notificação', {
            body: '@ana mencionou você',
            icon: '/favicon.ico'
        });
    });

    it('deve desconectar SSE ao desmontar', async () => {
        const { unmount } = renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(mensageriaService.conectarNotificacoes).toHaveBeenCalled();
        });

        unmount();

        expect(mockDesconectar).toHaveBeenCalled();
    });

    it('não deve criar notificação do navegador se permissão negada', async () => {
        (global as any).Notification.permission = 'denied';
        
        let onNotificacaoCallback: ((notificacao: Notificacao) => void) | null = null;

        (mensageriaService.conectarNotificacoes as jest.Mock).mockImplementation(
            (onNotificacao: (n: Notificacao) => void) => {
                onNotificacaoCallback = onNotificacao;
                return mockDesconectar;
            }
        );

        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(onNotificacaoCallback).not.toBeNull();
        });

        const novaNotificacao: Notificacao = {
            id: '4',
            tipo: 'curtida_post',
            mensagem: '@lucas curtiu seu post',
            lida: false,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-5',
                username: 'lucas',
            },
        };

        onNotificacaoCallback!(novaNotificacao);

        expect(mockNotification).not.toHaveBeenCalled();
    });

    it('não deve adicionar notificação quando preferências bloqueiam o tipo', async () => {
        const mockDeveNotificar = jest.fn().mockReturnValue(false);
        (useNotPrefStore as unknown as jest.Mock).mockReturnValue({
            deveNotificar: mockDeveNotificar,
        });

        let onNotificacaoCallback: ((notificacao: Notificacao) => void) | null = null;

        (mensageriaService.conectarNotificacoes as jest.Mock).mockImplementation(
            (onNotificacao: (n: Notificacao) => void) => {
                onNotificacaoCallback = onNotificacao;
                return mockDesconectar;
            }
        );

        renderHook(() => useNotificacoes());

        await waitFor(() => {
            expect(onNotificacaoCallback).not.toBeNull();
        });

        const novaNotificacao: Notificacao = {
            id: '5',
            tipo: 'curtida_post',
            mensagem: '@teste curtiu seu post',
            lida: false,
            criadaEm: new Date().toISOString(),
            remetente: {
                id: 'user-6',
                username: 'teste',
            },
        };

        onNotificacaoCallback!(novaNotificacao);

        expect(mockDeveNotificar).toHaveBeenCalledWith('curtida_post');
        expect(mockAdicionarNotificacao).not.toHaveBeenCalled();
        
        // Resetar para outros testes
        (global as any).Notification.permission = 'granted';
    });
});

describe('useSolicitaPermissao Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequestPermission.mockResolvedValue('granted');
    });

    it('deve solicitar permissão quando permissão é default', async () => {
        (global as any).Notification.permission = 'default';

        renderHook(() => useSolicitaPermissao());

        await waitFor(() => {
            expect(mockRequestPermission).toHaveBeenCalled();
        });
    });

    it('não deve solicitar permissão se já foi concedida', () => {
        (global as any).Notification.permission = 'granted';

        renderHook(() => useSolicitaPermissao());

        expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('não deve solicitar permissão se foi negada', () => {
        (global as any).Notification.permission = 'denied';

        renderHook(() => useSolicitaPermissao());

        expect(mockRequestPermission).not.toHaveBeenCalled();
    });
});
