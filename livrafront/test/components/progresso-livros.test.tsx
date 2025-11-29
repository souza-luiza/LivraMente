import ProgressoLivros from "@/components/progresso-livros";
import { render, screen } from "@testing-library/react";

describe("ProgressoLivros Component", () => {
    it("renderiza corretamente os valores passados", () => {
        render(<ProgressoLivros lidos={3} total={10} />);

        expect(screen.getByText("Lidos 3 de 10")).toBeInTheDocument();
        expect(screen.getByText("30%")).toBeInTheDocument();
    });

    it("calcula corretamente a porcentagem", () => {
        render(<ProgressoLivros lidos={7} total={20} />);

        expect(screen.getByText("35%")).toBeInTheDocument();
    });

    it("usa os valores padrões quando nenhum é passado", () => {
        render(<ProgressoLivros lidos={0} total={1} />);

        expect(screen.getByText("Lidos 0 de 1")).toBeInTheDocument();
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("renderiza a barra de progresso com a largura correta", () => {
        const { container } = render(<ProgressoLivros lidos={5} total={10} />);

        // seleciona a barra externa
        const barraExterna = container.querySelector(".w-full.h-2");

        // seleciona a barra interna (primeiro filho)
        const barraInterna = barraExterna!.firstElementChild as HTMLElement;

        expect(barraInterna).toHaveStyle("width: 50%");
    });

    it("arredonda corretamente a porcentagem", () => {
        render(<ProgressoLivros lidos={1} total={3} />); // 33.33%

        expect(screen.getByText("33%")).toBeInTheDocument();
    });
});