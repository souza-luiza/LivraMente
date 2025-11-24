import ReadlistPage from "@/app/[username]/readlist/[readlistSlug]/page";
import { getSessionInfos } from "@/services/auth";
import { getReadlistBySlug } from "@/services/readlists";
import { render, waitFor, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";

jest.mock('@/services/readlists', () => ({
    getReadlistBySlug: jest.fn()
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn()
}));

jest.mock('@/services/auth', () => ({
  getSessionInfos: jest.fn(),
}));

// Mockando funcoes do useRouter:
const mockPush = jest.fn()
const mockBack = jest.fn()

describe('ReadlistPage Unitario', () => {

    const mockReadlistInfo = {
        nome: 'Readlist Teste',
        descricao: 'Descricao Teste',
        livros: [],
        slug: 'readlist-teste' 
    };

    // Mock de dados da sessao:
    const mockSessionInfo = {
        username: 'maria',
        email: 'maria@test.com',
        avatarUrl: 'maria.png',
        pronouns: 'she/her'
    }

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            back: mockBack
        });
        (useParams as jest.Mock).mockReturnValue({
            username: 'maria',
            readlistSlug: 'readlist-teste'
        });
    });

    describe('Renderizando Pagina', () => {
        beforeEach(async () => {
            (getSessionInfos as jest.Mock).mockResolvedValue(mockSessionInfo);
            (getReadlistBySlug as jest.Mock).mockResolvedValue(mockReadlistInfo);

            render(<ReadlistPage />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
            });
        });

        it('renderiza a pagina com o nome da readlist', async () => { // Teste unitario
            await waitFor(() => {
                expect(screen.getByText('Readlist Teste')).toBeInTheDocument();
            });
        });
    })
})