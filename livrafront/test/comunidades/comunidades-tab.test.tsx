import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock do servico inteiro
jest.mock("@/services/comunidades", () => ({
  getComunidades: jest.fn(),
}));

// Mock de outros componentes para simplificar
jest.mock("@/components/loading", () => () => <div data-testid="loading">Loading...</div>);
jest.mock("@/components/button", () => ({ text }: any) => <button>{text}</button>);
jest.mock("@/components/icons/HomeIcon", () => () => <span>HomeIcon</span>);

import { getComunidades } from "@/services/comunidades";
import ComunidadesTabs from "@/app/comunidades/comunidades-tab";

const mockComunidades = [
  { _id: "1", nome: "Romance Lovers", descricao: "Amamos romance", tags: ["romance"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: ""},
  { _id: "2", nome: "Aventureiros", descricao: "Amamos aventura", tags: ["aventura"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: ""},
];

describe("ComunidadesTabs", () => {
  afterEach(() => {
    jest.resetAllMocks(); // limpa mocks entre testes
  });

  it("exibe tela de loading inicialmente", async () => {
    (getComunidades as jest.Mock).mockResolvedValue(mockComunidades);

    render(<ComunidadesTabs />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());
  });

  it("exibe comunidades após carregar", async () => {
    (getComunidades as jest.Mock).mockResolvedValue(mockComunidades);

    render(<ComunidadesTabs />);
    await waitFor(() => {
      expect(screen.getByText("Romance Lovers")).toBeInTheDocument();
    });
  });

  it("exibe mensagem de erro quando falha no carregamento", async () => {
    (getComunidades as jest.Mock).mockRejectedValue(new Error("Falha"));

    render(<ComunidadesTabs />);
    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar as comunidades.")).toBeInTheDocument();
      expect(screen.getByText("Página Inicial")).toBeInTheDocument();
    });
  });

  it("permite trocar de aba e mostrar comunidades do gênero correto", async () => {
    (getComunidades as jest.Mock).mockResolvedValue(mockComunidades);

    render(<ComunidadesTabs />);
    await waitFor(() => expect(screen.getByText("Romance Lovers")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Aventura"));
    expect(screen.getByText("Aventureiros")).toBeInTheDocument();
    expect(screen.queryByText("Romance Lovers")).toBeNull();
  });
});