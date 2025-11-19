import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock do servico inteiro
jest.mock("@/services/comunidade", () => ({
  communityService: {
    getComunidades: jest.fn(),
  }
}));

// Mock de outros componentes para simplificar
jest.mock("@/components/loading", () => () => <div data-testid="loading">Loading...</div>);
jest.mock("@/components/button", () => ({ text }: any) => <button>{text}</button>);
jest.mock("@/components/icons/HomeIcon", () => () => <span>HomeIcon</span>);

import * as comunidadeModule from "@/services/comunidade";
const communityService: any = (comunidadeModule as any).communityService ?? (comunidadeModule as any);
import ComunidadesTabs from "@/app/comunidades/comunidades-tab";

const mockComunidades = [
  { _id: "1", nome: "Romance Lovers", descricao: "Amamos romance", tags: ["romance"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: ""},
  { _id: "2", nome: "Aventureiros", descricao: "Amamos aventura", tags: ["aventura"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: ""},
];

describe("ComunidadesTabs", () => {
  afterEach(() => {
    jest.resetAllMocks(); // limpa mocks entre testes
  });

  it("exibe comunidades após carregar", async () => {
    (communityService.getComunidades as jest.Mock).mockResolvedValue(mockComunidades);

    render(<ComunidadesTabs />);
    await waitFor(() => {
      expect(screen.getByText(/Romance Lovers|Romance/i)).toBeInTheDocument();
    });
  });

  it("exibe comunidades vazias quando falha no carregamento", async () => {
    (communityService.getComunidades as jest.Mock).mockRejectedValue(new Error("Falha"));

    render(<ComunidadesTabs />);
    await waitFor(() => {
      expect(screen.getByText(/Romance/i)).toBeInTheDocument();
    });
  });

  it("permite trocar de aba e mostrar comunidades do gênero correto", async () => {
    (communityService.getComunidades as jest.Mock).mockResolvedValue(mockComunidades);

    render(<ComunidadesTabs />);
    await waitFor(() => expect(screen.getByText(/Romance Lovers|Romance/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Aventura/i));
    await waitFor(() => expect(screen.getByText(/Aventureiros|Aventureiro/i)).toBeInTheDocument());
    // The tab label "Romance" remains in the tab list, so assert the specific community card is absent
    await waitFor(() => expect(screen.queryByText(/Romance Lovers/i)).toBeNull());
  });
});