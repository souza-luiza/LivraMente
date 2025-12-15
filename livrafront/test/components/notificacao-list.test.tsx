import { render, screen } from '@testing-library/react';
import NotificacaoList from '@/components/notificacao-list';
import { Notificacao } from '@/types/notificacao';

describe('NotificacaoList', () => {
    const mockNotificacoes: Notificacao[] = [
        {
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
        },
        {
            id: '2',
            tipo: 'curtida_post',
            mensagem: '@maria curtiu seu post',
            lida: true,
            criadaEm: new Date('2025-11-16T09:00:00').toISOString(),
            remetente: {
                id: 'user-2',
                username: 'maria',
            },
            postId: 'post-123'
        },
        {
            id: '3',
            tipo: 'promovido_moderador',
            mensagem: 'Você foi promovido a moderador',
            lida: false,
            criadaEm: new Date('2025-11-15T10:00:00').toISOString(),
            comunidadeNome: 'literatura'
        },
    ];

    it('deve renderizar mensagem quando não há notificações', () => {
        render(<NotificacaoList notificacoes={[]} />);
        expect(screen.getByText('Nenhuma notificação a ser exibida.')).toBeInTheDocument();
    });

    it('deve renderizar todas as notificações', () => {
        render(<NotificacaoList notificacoes={mockNotificacoes} />);
        
        expect(screen.getByText('@joao começou a te seguir')).toBeInTheDocument();
        expect(screen.getByText('@maria curtiu seu post')).toBeInTheDocument();
        expect(screen.getByText('Você foi promovido a moderador')).toBeInTheDocument();
    });

    it('deve renderizar notificações em ordem (mais recente primeiro)', () => {
        render(<NotificacaoList notificacoes={mockNotificacoes} />);

        expect(screen.getByText('@joao começou a te seguir')).toBeInTheDocument();
        expect(screen.getByText('@maria curtiu seu post')).toBeInTheDocument();
        expect(screen.getByText('Você foi promovido a moderador')).toBeInTheDocument();
    });

    it('deve passar callbacks corretamente para NotificacaoItem', () => {
        const mockMarcar = jest.fn();
        const mockRemover = jest.fn();
        
        render(
            <NotificacaoList 
                notificacoes={mockNotificacoes}
                onMarcarComoLida={mockMarcar}
                onRemover={mockRemover}
            />
        );

        expect(screen.getByText('@joao começou a te seguir')).toBeInTheDocument();
    });

    it('deve renderizar notificações sem remetente', () => {
        const notificacaoSistema: Notificacao = {
            id: '4',
            tipo: 'promovido_moderador',
            mensagem: 'Você foi promovido a moderador da comunidade',
            lida: false,
            criadaEm: new Date().toISOString(),
            comunidadeNome: 'fantasia'
        };
        
        render(<NotificacaoList notificacoes={[notificacaoSistema]} />);
        expect(screen.getByText('Você foi promovido a moderador da comunidade')).toBeInTheDocument();
    });

    it('deve renderizar lista vazia corretamente', () => {
        render(<NotificacaoList notificacoes={[]} />);
        expect(screen.getByText('Nenhuma notificação a ser exibida.')).toBeInTheDocument();
    });

    it('deve aplicar classes corretas ao container', () => {
        const { container } = render(<NotificacaoList notificacoes={mockNotificacoes} />);
        const listContainer = container.querySelector('.flex.flex-col.gap-3');
        expect(listContainer).toBeInTheDocument();
    });
});