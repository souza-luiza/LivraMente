import { render, screen } from "@testing-library/react";
import ComunidadesPage from "@/app/comunidades/page";

// mocks dos componentes filhos
jest.mock("@/components/sidebar", () => () => (
  <div data-testid="sidebar">Sidebar</div>
));
jest.mock("@/app/comunidades/comunidades-tab", () => () => (
  <div data-testid="comunidades-tabs">ComunidadesTabs</div>
));

describe("ComunidadesPage", () => {
  it("renderiza o layout corretamente", () => {
    render(<ComunidadesPage />);

    // Sidebar deve aparecer
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    // Titulo da página deve estar presente
    const title = screen.getByRole("heading", { level: 2, name: /comunidades/i });
    expect(title).toBeInTheDocument();

    // Tabs de comunidades devem estar no layout
    expect(screen.getByTestId("comunidades-tabs")).toBeInTheDocument();
  });

  it("possui a estrutura principal esperada", () => {
    const { container } = render(<ComunidadesPage />);

    // Verifica se a estrutura principal esta correta
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1 flex flex-col p-8");

    // Verifica o wrapper principal
    const wrapper = container.querySelector("div.flex");
    expect(wrapper).toHaveClass("min-h-screen bg-[#E5EEDF]");
  });
});
