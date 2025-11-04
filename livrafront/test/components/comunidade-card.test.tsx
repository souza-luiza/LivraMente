import { render, screen } from "@testing-library/react";
import Comunidade from "@/components/comunidade-card";

describe("Comunidade Card", () => {
  const defaultProps = {
    id: "123",
    nome: "Comunidade Teste",
    descricao: "Descrição da comunidade teste",
    image: "https://example.com/image.png"
  };

  it("renderiza corretamente com todos os props", () => {
    render(<Comunidade {...defaultProps} />);

    expect(screen.getByText("Comunidade Teste")).toBeInTheDocument();
    expect(screen.getByText("Descrição da comunidade teste")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/comunidades/123");
    expect(screen.getByAltText("Imagem da Comunidade")).toBeInTheDocument();
  });

  it("renderiza placeholders quando props não são passados", () => {
    render(<Comunidade id={""} nome={""} />);
    
    expect(screen.getByText("Nome da comunidade")).toBeInTheDocument();
    expect(screen.getByText("Descrição da comunidade")).toBeInTheDocument();
  });

  it("não renderiza imagem quando não fornecida", () => {
    render(<Comunidade id="1" nome="Teste" descricao="Desc" />);
    
    expect(screen.queryByAltText("Imagem da Comunidade")).toBeNull();
  });
});