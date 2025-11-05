import { render, screen } from "@testing-library/react";
import { Comunidade as ComunidadeType } from "@/types/comunidade";
import Comunidades from "@/app/comunidades/comunidades";

const mockComunidades: ComunidadeType[] = [
  { _id: "1", nome: "Romance Lovers", descricao: "Amamos romance", tags: ["romance"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: "" },
  { _id: "2", nome: "Aventureiros", descricao: "Amamos aventura", tags: ["aventura"], imagem_url: "", moderadores: [], membros: [], posts: [], createdAt: "", updatedAt: "" },
];

describe("Comunidades", () => {
  it("renderiza todas as comunidades quando não há filtro", () => {
    render(<Comunidades comunidades={mockComunidades} />);
    expect(screen.getByText("Romance Lovers")).toBeInTheDocument();
    expect(screen.getByText("Aventureiros")).toBeInTheDocument();
  });

  it("filtra comunidades pelo gênero", () => {
    render(<Comunidades comunidades={mockComunidades} genero="romance" />);
    expect(screen.getByText("Romance Lovers")).toBeInTheDocument();
    expect(screen.queryByText("Aventureiros")).toBeNull();
  });

  it("renderiza vazio quando nenhuma comunidade corresponde ao filtro", () => {
    render(<Comunidades comunidades={mockComunidades} genero="fantasia" />);
    expect(screen.queryByText("Romance Lovers")).toBeNull();
    expect(screen.queryByText("Aventureiros")).toBeNull();
  });
});
