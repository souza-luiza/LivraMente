import { render, screen, fireEvent } from '@testing-library/react';
import NotificacaoItem from '@/components/notificacao-item';
import { Notificacao } from '@/types/notificacao';

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

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

    it('deve navegar para o perfil do remetente ao clicar na foto', () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
            push: mockPush,
        });

        const notifComFoto: Notificacao = {
            ...notificacaoNaoLida,
            remetente: {
                id: 'user-1',
                username: 'joao',
                foto_perfil: 'https://example.com/joao.jpg',
            },
        };

        render(<NotificacaoItem notificacao={notifComFoto} />);

        const fotoElement = screen.getByAltText('@joao');
        fireEvent.click(fotoElement);

        expect(mockPush).toHaveBeenCalledWith('/joao');
    });

    it('deve navegar e marcar como lida ao clicar no conteúdo', () => {
        const mockMarcarComoLida = jest.fn();
        const mockPush = jest.fn();
        const mockUseRouter = jest.spyOn(require('next/navigation'), 'useRouter');
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });

        render(
            <NotificacaoItem 
                notificacao={notificacaoNaoLida}
                onMarcarComoLida={mockMarcarComoLida}
            />
        );

        const conteudo = screen.getByText('@joao começou a te seguir').parentElement;
        fireEvent.click(conteudo!);

        expect(mockMarcarComoLida).toHaveBeenCalledWith('1');
        expect(mockPush).toHaveBeenCalledWith('/joao');
    });

    it('deve navegar para postagem de comunidade corretamente', () => {
        const mockPush = jest.fn();
        const mockUseRouter = jest.spyOn(require('next/navigation'), 'useRouter');
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });

        const notifComunidade: Notificacao = {
            ...notificacaoNaoLida,
            tipo: 'novo_post_comunidade',
            mensagem: 'Novo post na comunidade',
            comunidadeNome: 'Livros de Ficção',
            postId: 'post-123',
        };

        render(<NotificacaoItem notificacao={notifComunidade} />);

        const conteudo = screen.getByText('Novo post na comunidade').parentElement;
        fireEvent.click(conteudo!);

        expect(mockPush).toHaveBeenCalledWith('/comunidade/livros-de-ficcao/postagem/post-123');
    });

    it('deve navegar para postagem ao clicar em notificação de curtida', () => {
        const mockPush = jest.fn();
        const mockUseRouter = jest.spyOn(require('next/navigation'), 'useRouter');
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });

        const notifCurtida: Notificacao = {
            ...notificacaoNaoLida,
            tipo: 'curtida_post',
            mensagem: 'Alguém curtiu seu post',
            comunidadeNome: 'Comunidade Teste',
            postId: 'post-456',
        };

        render(<NotificacaoItem notificacao={notifCurtida} />);

        const conteudo = screen.getByText('Alguém curtiu seu post').parentElement;
        fireEvent.click(conteudo!);

        expect(mockPush).toHaveBeenCalledWith('/comunidade/comunidade-teste/postagem/post-456');
    });

    it('deve exibir imagem padrão se não houver foto de perfil', () => {
        const notifSemFoto: Notificacao = {
            ...notificacaoNaoLida,
            remetente: {
                id: 'user-1',
                username: 'joao',
            },
        };

        render(<NotificacaoItem notificacao={notifSemFoto} />);

        const img = screen.getByAltText('@joao');
        expect(img).toHaveAttribute('src', '/AbstractUser.png');
    });

    it('deve exibir ícone de info quando não houver remetente', () => {
        const notifSemRemetente: Notificacao = {
            ...notificacaoNaoLida,
            remetente: undefined,
        };

        const { container } = render(<NotificacaoItem notificacao={notifSemRemetente} />);
        
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('não deve navegar se remetente não tiver username', () => {
        const mockPush = jest.fn();
        const mockUseRouter = jest.spyOn(require('next/navigation'), 'useRouter');
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });

        const notifSemUsername: Notificacao = {
            ...notificacaoNaoLida,
            tipo: 'novo_seguidor',
            remetente: {
                id: 'user-1',
                username: '',
            },
        };

        render(<NotificacaoItem notificacao={notifSemUsername} />);

        const conteudo = screen.getByText('@joao começou a te seguir').parentElement;
        fireEvent.click(conteudo!);

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('não deve chamar marcarComoLida se já estiver lida ao navegar', () => {
        const mockMarcarComoLida = jest.fn();
        const mockPush = jest.fn();
        const mockUseRouter = jest.spyOn(require('next/navigation'), 'useRouter');
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });

        render(
            <NotificacaoItem 
                notificacao={notificacaoLida}
                onMarcarComoLida={mockMarcarComoLida}
            />
        );

        const conteudo = screen.getByText('@joao começou a te seguir').parentElement;
        fireEvent.click(conteudo!);

        expect(mockMarcarComoLida).not.toHaveBeenCalled();
    });
});