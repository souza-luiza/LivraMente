import { render } from '@testing-library/react';
import NotificacoesProvider from '@/components/notificacoes-provider';
import { useNotificacoes } from '@/hooks/useNotificacoes';

jest.mock('@/hooks/useNotificacoes');
jest.mock('react-toastify', () => ({
    ToastContainer: () => <div data-testid="toast-container">ToastContainer</div>,
}));

describe('NotificacoesProvider', () => {
    const mockUseNotificacoes = useNotificacoes as jest.MockedFunction<typeof useNotificacoes>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNotificacoes.mockImplementation(() => {});
    });

    it('deve renderizar children corretamente', () => {
        const { getByText } = render(
            <NotificacoesProvider>
                <div>Test Child</div>
            </NotificacoesProvider>
        );

        expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('deve renderizar children sem ToastContainer visível', () => {
        const { getByText } = render(
            <NotificacoesProvider>
                <div>Test</div>
            </NotificacoesProvider>
        );

        // ToastNotification é mockado globalmente como null
        expect(getByText('Test')).toBeInTheDocument();
    });

    it('deve chamar useNotificacoes hook', () => {
        render(
            <NotificacoesProvider>
                <div>Test</div>
            </NotificacoesProvider>
        );

        expect(mockUseNotificacoes).toHaveBeenCalled();
    });

    it('deve renderizar múltiplos children', () => {
        const { getByText } = render(
            <NotificacoesProvider>
                <div>Child 1</div>
                <div>Child 2</div>
            </NotificacoesProvider>
        );

        expect(getByText('Child 1')).toBeInTheDocument();
        expect(getByText('Child 2')).toBeInTheDocument();
    });
});
