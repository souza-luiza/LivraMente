import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { getSessionInfos } from '@/services/auth';
import { getProfile } from '@/services/userService';
import { toast } from 'react-toastify/unstyled';

// Mock dos módulos
jest.mock('@/services/auth');
jest.mock('@/services/userService');
jest.mock('react-toastify/unstyled');
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    useAnimation: () => ({
        start: jest.fn(),
    }),
}));

jest.mock('@/components/sidebar', () => {
    return function Sidebar() {
        return <div data-testid="sidebar">Sidebar</div>;
    };
});

jest.mock('@/components/searchbar', () => {
    return function SearchBar() {
        return <div data-testid="searchbar">SearchBar</div>;
    };
});

jest.mock('@/components/button', () => {
    return function Button({ text, path }: any) {
        return <a href={path} data-testid={`button-${text.toLowerCase()}`}>{text}</a>;
    };
});

jest.mock('next/dist/client/link', () => {
    return function Link({ children, href }: any) {
        return <a href={href}>{children}</a>;
    };
});

const mockGetSessionInfos = getSessionInfos as jest.MockedFunction<typeof getSessionInfos>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve exibir tela de loading inicialmente', () => {
        mockGetSessionInfos.mockImplementation(() => new Promise(() => {})); // Promise que nunca resolve
        
        const { container } = render(<HomePage />);
        
        // Verifica se existe um elemento com a classe de loading (spinner)
        const spinner = container.querySelector('.animate-\\[spin_1\\.5s_ease-in-out_infinite\\]');
        expect(spinner).toBeInTheDocument();
        
        // Verifica se o background de loading está presente
        expect(container.querySelector('.bg-\\[\\#E5EEDF\\]')).toBeInTheDocument();
    });

    it('deve exibir página de login quando usuário não está logado', async () => {
        mockGetSessionInfos.mockResolvedValue(null);
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(screen.getByTestId('left-section')).toBeInTheDocument();
            expect(screen.getByTestId('center-section')).toBeInTheDocument();
            expect(screen.getByTestId('right-section')).toBeInTheDocument();
        });

        expect(screen.getByText('LivraMente')).toBeInTheDocument();
        expect(screen.getByText('A rede dos leitores brasileiros')).toBeInTheDocument();
        expect(screen.getByTestId('button-entrar')).toBeInTheDocument();
        expect(screen.getByTestId('button-cadastrar')).toBeInTheDocument();
    });

    it('deve exibir os benefícios quando não logado', async () => {
        mockGetSessionInfos.mockResolvedValue(null);
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(screen.getByTestId('benefits-container')).toBeInTheDocument();
        });

        expect(screen.getByText('Acompanhe sua leitura e ganhe XP')).toBeInTheDocument();
        expect(screen.getByText('Registre seu progresso e metas')).toBeInTheDocument();
    });

    it('deve exibir sidebar e searchbar quando usuário está logado', async () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            bio: 'Test bio',
            profilePicture: 'test.jpg',
            readlists: []
        };

        mockGetSessionInfos.mockResolvedValue({ username: 'testuser' });
        mockGetProfile.mockResolvedValue(mockUserData);
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('searchbar')).toBeInTheDocument();
        });

        expect(screen.getByText('Comunidades')).toBeInTheDocument();
        expect(screen.getByText('Criar História')).toBeInTheDocument();
    });

    it('deve exibir toast de erro quando falha ao carregar dados do usuário', async () => {
        mockGetSessionInfos.mockResolvedValue({ username: 'testuser' });
        mockGetProfile.mockRejectedValue(new Error('Erro ao carregar'));
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Erro ao carregar dados do usuário.');
        });
    });

    it('deve definir isLoggedIn como false quando ocorre erro', async () => {
        mockGetSessionInfos.mockRejectedValue(new Error('Erro de autenticação'));
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(screen.getByTestId('left-section')).toBeInTheDocument();
        });

        expect(screen.getByTestId('button-entrar')).toBeInTheDocument();
    });

    it('deve carregar perfil do usuário quando logado', async () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            bio: 'Test bio',
            profilePicture: 'test.jpg',
            readlists: []
        };

        mockGetSessionInfos.mockResolvedValue({ username: 'testuser' });
        mockGetProfile.mockResolvedValue(mockUserData);
        
        render(<HomePage />);
        
        await waitFor(() => {
            expect(mockGetProfile).toHaveBeenCalledWith('testuser');
        });
    });
});