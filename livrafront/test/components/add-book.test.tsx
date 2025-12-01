import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { livrosService } from "@/services/livros";
import { addBookToReadlist } from "@/services/readlists";
import { toast } from "react-toastify";
import AddBook from "@/components/add-book";

// Mock dos serviços externos
jest.mock("@/services/livros", () => ({
  livrosService: {
    getLivros: jest.fn(),
  }
}));

jest.mock("@/services/readlists", () => ({
  addBookToReadlist: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

// Mock do componente Image do Next.js
jest.mock("next/image", () => (props: any) => <img {...props} />);

jest.mock("@/components/toast-notification", () => () => <div data-testid="toast" />);

const mockLivros = [
  { _id: "1", titulo: "Livro A", capa_url: "" },
  { _id: "2", titulo: "Livro B", capa_url: "" },
  { _id: "3", titulo: "Livro C", capa_url: "" },
];

describe("AddBook Component", () => {

  const renderComponent = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      readlistId: "readlist123",
      onSave: jest.fn(),
      livrosReadlist: [],
      ...props
    };

    return render(<AddBook {...defaultProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (livrosService.getLivros as jest.Mock).mockResolvedValue(mockLivros);
    (addBookToReadlist as jest.Mock).mockResolvedValue({});
  });

  test("renderiza o modal quando isOpen = true", async () => {
    renderComponent();

    expect(await screen.findByText("Selecione os livros para sua readlist")).toBeInTheDocument();
  });

  test("exibe carregando no início", () => {
    renderComponent();

    expect(screen.getByTestId("spinning-element")).toBeInTheDocument();
  });

  test("carrega e exibe os livros", async () => {
    renderComponent();

    expect(await screen.findByText("Livro A")).toBeInTheDocument();
    expect(screen.getByText("Livro B")).toBeInTheDocument();
  });

  test("filtra livros pela busca", async () => {
    renderComponent();

    await screen.findByText("Livro A");

    fireEvent.change(screen.getByPlaceholderText("Busque ou selecione um livro"), {
      target: { value: "Livro B" },
    });

    expect(screen.queryByText("Livro A")).not.toBeInTheDocument();
    expect(screen.getByText("Livro B")).toBeInTheDocument();
  });

  test("seleciona um livro ao clicar", async () => {
    renderComponent();

    fireEvent.click(await screen.findByText("Livro A"));

    // Dentro da lista de livros selecionados
    const listaSelecionados = screen.getByText("Livros selecionados:").parentElement;
    expect(within(listaSelecionados!).getByText("Livro A")).toBeInTheDocument();
  });

  test("remove livro selecionado ao clicar nele na lista direita", async () => {
    renderComponent();

    // Espera o livro estar disponível para seleção
    const livroA = await screen.findByText("Livro A");
    fireEvent.click(livroA);

    // Agora dentro da lista de livros selecionados
    const listaSelecionados = screen.getByText("Livros selecionados:").parentElement!;
    const livroSelecionado = within(listaSelecionados).getByText("Livro A");
    fireEvent.click(livroSelecionado);

    // Confirma que foi removido
    expect(within(listaSelecionados).queryByText("Livro A")).not.toBeInTheDocument();
  });

  test("botão Adicionar Livros chama a API e onSave", async () => {
    const onSave = jest.fn();
    renderComponent({ onSave });

    fireEvent.click(await screen.findByText("Livro A"));
    fireEvent.click(screen.getByText("Adicionar Livros"));

    await waitFor(() => {
      expect(addBookToReadlist).toHaveBeenCalledWith("readlist123", ["1"]);
    });

    expect(onSave).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  test("botão Cancelar limpa seleção e chama onClose", async () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    fireEvent.click(await screen.findByText("Livro A"));
    fireEvent.click(screen.getByText("Cancelar"));

    expect(onClose).toHaveBeenCalled();
  });

  test("clicar fora fecha o modal", async () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    await screen.findByText("Livro A");

    const overlay = document.querySelector('.fixed.inset-0');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

});