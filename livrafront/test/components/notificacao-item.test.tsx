import { render, screen, fireEvent } from '@testing-library/react';
import NotificacaoItem from '@/components/notificacao-item';
import { Notificacao } from '@/types/notificacao';

describe('NotificacaoItem', () => {
    const notificacaoNaoLida: Notificacao = {
        id: '1',
        tipo: 'novo_seguidor',
        mensagem: '@joao começou a te seguir',
        lida: false,
        criadaEm: new Date().toISOString(),
        remetente: {
            id: 'user-1',
            username: 'joao',
        },
    };

    const notificacaoLida: Notificacao = {
        ...notificacaoNaoLida,
        lida: true,
    };

    it('deve renderizar a mensagem da notificação', () => {
        render(<NotificacaoItem notificacao={notificacaoNaoLida} />);
        expect(screen.getByText('@joao começou a te seguir')).toBeInTheDocument();
    });

    it('deve aplicar estilo diferente para notificação não lida', () => {
        const { container } = render(<NotificacaoItem notificacao={notificacaoNaoLida} />);
        const notifElement = container.firstChild as HTMLElement;
        expect(notifElement.className).toContain('light-green');
    });

    it('não deve aplicar estilo especial para notificação lida', () => {
        const { container } = render(<NotificacaoItem notificacao={notificacaoLida} />);
        const notifElement = container.firstChild as HTMLElement;
        expect(notifElement.className).not.toContain('light-green');
    });

    it('deve chamar onMarcarComoLida quando clicar no botão', () => {
        const mockMarcarComoLida = jest.fn();
        render(
            <NotificacaoItem
                notificacao={notificacaoNaoLida}
                onMarcarComoLida={mockMarcarComoLida}
            />
        );

        const menuButton = screen.getByLabelText('Opções');
        fireEvent.click(menuButton);

        const marcarButton = screen.getByText('Marcar como lida');
        fireEvent.click(marcarButton);

        expect(mockMarcarComoLida).toHaveBeenCalledWith('1');
    });

    it('deve chamar onRemover quando clicar no botão de remover', () => {
        const mockRemover = jest.fn();
        render(
            <NotificacaoItem
                notificacao={notificacaoNaoLida}
                onRemover={mockRemover}
            />
        );

        const menuButton = screen.getByLabelText('Opções');
        fireEvent.click(menuButton);

        const removerButton = screen.getByText('Remover');
        fireEvent.click(removerButton);

        expect(mockRemover).toHaveBeenCalledWith('1');
    });

    it('não deve mostrar botão "Marcar como lida" se já estiver lida', () => {
        render(
            <NotificacaoItem
                notificacao={notificacaoLida}
                onMarcarComoLida={jest.fn()}
            />
        );

        const menuButton = screen.getByLabelText('Opções');
        fireEvent.click(menuButton);

        expect(screen.queryByText('Marcar como lida')).not.toBeInTheDocument();
    });

    it('deve renderizar ícone correto para cada tipo', () => {
        const tipos: Array<Notificacao['tipo']> = [
            'curtida_post',
            'comentario_post',
            'novo_seguidor',
            'mencao',
        ];

        tipos.forEach((tipo) => {
            const { container } = render(
                <NotificacaoItem
                    notificacao={{ ...notificacaoNaoLida, tipo }}
                />
            );
            expect(container.querySelector('svg')).toBeInTheDocument();
        });
    });

    it('deve fechar menu ao clicar fora', () => {
        const mockRemover = jest.fn();
        render(
            <NotificacaoItem 
                notificacao={notificacaoNaoLida}
                onRemover={mockRemover}
            />
        );

        const menuButton = screen.getByLabelText('Opções');
        fireEvent.click(menuButton);
        
        const removerButton = screen.getByText('Remover');
        expect(removerButton).toBeInTheDocument();

        fireEvent.mouseDown(document);

        expect(screen.queryByText('Remover')).not.toBeInTheDocument();
    });
});