import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AddReadlist from "@/components/add-readlist";
import { getOwnReadlists, addReadlistToBook } from "@/services/readlists";
import { toast } from "react-toastify";

// Mocks
jest.mock("@/services/readlists", () => ({
  getOwnReadlists: jest.fn(),
  addReadlistToBook: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock("next/image", () => (props: any) => <img {...props} />);

jest.mock("@/components/toast-notification", () => () => <div data-testid="toast" />);

describe("AddReadlist Component", () => {

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const mockReadlists = [
    { _id: "1", nome: "Sci-fi", capa_url: "" },
    { _id: "2", nome: "Romance", capa_url: "" },
    { _id: "3", nome: "Fantasia", capa_url: "" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = async (props = {}) => {
    (getOwnReadlists as jest.Mock).mockResolvedValue(mockReadlists);

    render(
      <AddReadlist
        isOpen={true}
        onClose={mockOnClose}
        livroId="abc123"
        onSave={mockOnSave}
        readlistsLivro={[]} // Nenhuma readlist já vinculada
        {...props}
      />
    );

    await waitFor(() => {
      expect(getOwnReadlists).toHaveBeenCalled();
    });
  };

  test("renderiza corretamente quando aberto", async () => {
    await setup();

    expect(screen.getByText("Selecione as readlists para seu livro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Busque ou selecione uma readlist")).toBeInTheDocument();
  });

  test("lista readlists retornadas pelo backend", async () => {
    await setup();

    expect(screen.getByText("Sci-fi")).toBeInTheDocument();
    expect(screen.getByText("Romance")).toBeInTheDocument();
    expect(screen.getByText("Fantasia")).toBeInTheDocument();
  });

  test("filtra readlists pela busca", async () => {
    await setup();

    const input = screen.getByPlaceholderText("Busque ou selecione uma readlist");
    fireEvent.change(input, { target: { value: "rom" } });

    expect(screen.queryByText("Sci-fi")).not.toBeInTheDocument();
    expect(screen.getByText("Romance")).toBeInTheDocument();
  });

  test("seleciona uma readlist", async () => {
    await setup();

    fireEvent.click(await screen.findByText("Sci-fi"));

    const listaSelecionados = screen.getByText("Readlists selecionadas:").parentElement;
    expect(within(listaSelecionados!).getByText("Sci-fi")).toBeInTheDocument();
  });

  test("remove uma readlist selecionada", async () => {
    await setup();

    const scifi = await screen.findByText("Sci-fi");
    fireEvent.click(scifi);

    // Clicar para remover
    const listaSelecionados = screen.getByText("Readlists selecionadas:").parentElement!;
    const readlistSelecionado = within(listaSelecionados).getByText("Sci-fi");
    fireEvent.click(readlistSelecionado);

    expect(screen.getByText("Nenhuma readlist foi selecionada ainda.")).toBeInTheDocument();
  });

  test("adiciona readlists ao livro", async () => {
    (addReadlistToBook as jest.Mock).mockResolvedValue({});

    await setup();

    fireEvent.click(await screen.findByText("Sci-fi"));

    fireEvent.click(screen.getByText("Adicionar Livro"));

    await waitFor(() => {
      expect(addReadlistToBook).toHaveBeenCalledWith("abc123", ["1"]);
      expect(toast.success).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("cancelar fecha o modal e limpa seleção", async () => {
    await setup();

    fireEvent.click(screen.getByText("Sci-fi"));
    fireEvent.click(screen.getByText("Cancelar"));

    expect(mockOnClose).toHaveBeenCalled();
  });

});