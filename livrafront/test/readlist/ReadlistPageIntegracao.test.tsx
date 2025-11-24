import { useParams, useRouter } from "next/navigation";
import { getReadlistBySlug } from "@/services/readlists";
import { render, waitFor, screen } from "@testing-library/react";
import ReadlistPage from "@/app/[username]/readlist/[readlistSlug]/page";

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn()
}));

describe("ReadlistPage Integracao", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            back: jest.fn()
        });
        (useParams as jest.Mock).mockReturnValue({
            username: 'maria',
            readlistSlug: 'readlist-teste'
        });
    });

  it("carrega e retorna readlist usando os serviços reais", async () => {
    global.fetch = jest.fn((url) => {
        if (url.includes("/readlist-teste")) {
            return Promise.resolve({
            ok: true,
            json: async () => ({ nome: 'Readlist Teste', descricao: 'Descricao Teste', livros: [], slug: 'readlist-teste' })
            });
        }

        if (url.includes("/auth/session-info")) {
            return Promise.resolve({
                ok: true,
                json: async () => ({
                    username: "maria",
                    email: "maria@test.com",
                    avatarUrl: "maria.png",
                    pronouns: "she/her",
                }),
            });
        }
    }) as any;

    await getReadlistBySlug('readlist-teste');

    render(<ReadlistPage />);
    await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
        expect(screen.getByText('Readlist Teste')).toBeInTheDocument();
    });
    
  });
});