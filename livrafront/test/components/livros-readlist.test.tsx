import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Livro } from "@/types/livro";
import LivrosReadlist from "@/components/livros-readlist";

const mockLivro: Livro = {
    _id: "123",
    titulo: "Livro Teste",
    slug: "livro-teste",
    capa_url: "/capa.jpg",
    isbn: "",
    autores: [],
    ano_publicacao: 0,
    sinopse: "",
    numero_paginas: 0,
    generos: [],
    avaliacoes_count: 0,
    avaliacoes_media: 0
};

describe("LivrosReadlist Component", () => {

    test("renderiza imagem da capa", () => {
        render(<LivrosReadlist livro={mockLivro} />);

        const img = screen.getByAltText("Capa do livro Livro Teste");
        expect(img).toBeInTheDocument();
    });

    test("não mostra menu quando não é owner", () => {
        render(<LivrosReadlist livro={mockLivro} isCurrentUserOwner={false} />);

        const options = screen.queryByText("Visitar Página do Livro");
        expect(options).not.toBeInTheDocument();
    });

    test("abre menu ao clicar na imagem quando é owner", () => {
        render(<LivrosReadlist livro={mockLivro} isCurrentUserOwner={true} />);

        const img = screen.getByAltText("Capa do livro Livro Teste");
        fireEvent.click(img);

        const visitBtn = screen.getByText("Visitar Página do Livro");
        expect(visitBtn).toBeInTheDocument();
    });

    test("chama função handleRemoveBook ao clicar no botão", () => {
        const mockRemove = jest.fn();

        render(
            <LivrosReadlist 
                livro={mockLivro} 
                isCurrentUserOwner={true}
                handleRemoveBook={mockRemove}
            />
        );

        const img = screen.getByAltText("Capa do livro Livro Teste");
        fireEvent.click(img);

        const removeBtn = screen.getByText("Remover da Readlist");
        fireEvent.click(removeBtn);

        expect(mockRemove).toHaveBeenCalledWith("123");
    });
});