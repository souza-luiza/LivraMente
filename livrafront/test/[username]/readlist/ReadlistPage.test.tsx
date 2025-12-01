import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { useRouter, useParams } from "next/navigation";
import React from "react";

// Mock Next Navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

// Mock componentes
jest.mock("@/components/sidebar", () => () => <div>Sidebar</div>);
jest.mock("@/components/searchbar", () => () => <div>SearchBar</div>);
jest.mock("@/components/livros-readlist", () => (props: any) => (
  <div>
    <span>{props.livro.titulo}</span>
    <button
      data-testid={`remove-${props.livro._id}`}
      onClick={() => props.handleRemoveBook(props.livro._id)}
    >
      Remover
    </button>
  </div>
));
jest.mock("@/components/loading", () => () => <div>LoadingPage</div>);
jest.mock("@/components/toast-notification", () => () => <div>Toast</div>);
jest.mock("@/components/EditReadlistModal", () => (props: any) =>
  props.isOpen ? <div>EditModal</div> : null
);
jest.mock("@/components/add-book", () => (props: any) =>
  props.isOpen ? <div>AddBookModal</div> : null
);
jest.mock("@/components/portable-loading", () => () => <div>LoadingBooks</div>);
jest.mock("@/components/pop-up", () => (props: any) => {
  if (!props.isOpen) return null;
  return (
    <div>
      <div>DeletePopUp</div>
      <button data-testid="confirm-delete" onClick={props.button2.onClick}>
        ConfirmarDelete
      </button>
      <button data-testid="cancel-delete" onClick={props.button1.onClick}>
        Cancelar
      </button>
    </div>
  );
});

// Mock serviços usados na página
jest.mock("@/services/auth", () => ({
  getSessionInfos: jest.fn(),
}));

jest.mock("@/services/readlists", () => ({
  getReadlistBySlug: jest.fn(),
  getOnePublicReadlist: jest.fn(),
  checkReadlistFav: jest.fn(),
  favoriteReadlist: jest.fn(),
  unfavoriteReadlist: jest.fn(),
  removeBookFromReadlist: jest.fn(),
  updateReadlist: jest.fn(),
  deleteReadlist: jest.fn(),
}));

jest.mock("@/services/userService", () => ({
  getProfile: jest.fn(),
}));

// Importando mocks reais
import { getSessionInfos } from "@/services/auth";
import {
  getReadlistBySlug,
  getOnePublicReadlist,
  checkReadlistFav,
  favoriteReadlist,
  unfavoriteReadlist,
  removeBookFromReadlist,
  deleteReadlist,
} from "@/services/readlists";
import { getProfile } from "@/services/userService";
import ReadlistPage from "@/app/[username]/readlist/[readlistSlug]/page";

describe("ReadlistPage", () => {
  const pushMock = jest.fn();
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });
    (useParams as jest.Mock).mockReturnValue({
      username: "joao",
      readlistSlug: "minha-readlist",
    });
  });

  const fakeReadlist = {
    _id: "123",
    nome: "Minha Readlist",
    descricao: "Descrição teste",
    capa_url: "",
    publica: true,
    livros: [
      { _id: "liv1", titulo: "Livro 1" },
      { _id: "liv2", titulo: "Livro 2" },
    ],
  };

  const fakeUser = {
    username: "joao",
    avatarUrl: "",
  };

  test("renderiza loading inicialmente", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(fakeUser);

    render(<ReadlistPage />);

    expect(screen.getByText("LoadingPage")).toBeInTheDocument();
  });

  test("carrega readlist quando o usuário é dono", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(fakeUser);
    (getReadlistBySlug as jest.Mock).mockResolvedValue(fakeReadlist);
    (getProfile as jest.Mock).mockResolvedValue(fakeUser);

    render(<ReadlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Minha Readlist")).toBeInTheDocument();
    });

    expect(getReadlistBySlug).toHaveBeenCalledWith("minha-readlist");
    expect(screen.getByText("Livro 1")).toBeInTheDocument();
  });

  test("carrega readlist pública quando NÃO é o dono", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue({ username: "maria" });
    (getOnePublicReadlist as jest.Mock).mockResolvedValue(fakeReadlist);
    (checkReadlistFav as jest.Mock).mockResolvedValue({ isFavorited: true });
    (getProfile as jest.Mock).mockResolvedValue(fakeUser);

    render(<ReadlistPage />);

    await waitFor(() => {
      expect(getOnePublicReadlist).toHaveBeenCalled();
      expect(screen.getByText("Minha Readlist")).toBeInTheDocument();
    });
  });

  test("favoritar readlist", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue({ username: "maria" });
    (getOnePublicReadlist as jest.Mock).mockResolvedValue(fakeReadlist);
    (checkReadlistFav as jest.Mock).mockResolvedValue({ isFavorited: false });
    (getProfile as jest.Mock).mockResolvedValue(fakeUser);

    render(<ReadlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Favoritar")).toBeInTheDocument();
    });

    const btn = screen.getByText("Favoritar");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(favoriteReadlist).toHaveBeenCalled();
  });

  test("remove livro da readlist", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(fakeUser);
    (getReadlistBySlug as jest.Mock).mockResolvedValue(fakeReadlist);
    (removeBookFromReadlist as jest.Mock).mockResolvedValue({});
    (getReadlistBySlug as jest.Mock).mockResolvedValue(fakeReadlist);

    render(<ReadlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Livro 1")).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId("remove-liv1");

    await act(async () => {
        fireEvent.click(removeButton);
    });

    expect(removeBookFromReadlist).toHaveBeenCalledWith("123", "liv1");
  });

  test("abre modal de edição", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(fakeUser);
    (getReadlistBySlug as jest.Mock).mockResolvedValue(fakeReadlist);
    (getProfile as jest.Mock).mockResolvedValue(fakeUser);

    render(<ReadlistPage />);

    await waitFor(() => screen.getByText("Editar Readlist"));

    fireEvent.click(screen.getByText("Editar Readlist"));

    expect(screen.getByText("EditModal")).toBeInTheDocument();
  });

  test("confirma e apaga readlist", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(fakeUser);
    (getReadlistBySlug as jest.Mock).mockResolvedValue(fakeReadlist);
    (getProfile as jest.Mock).mockResolvedValue(fakeUser);
    (deleteReadlist as jest.Mock).mockResolvedValue({});

    render(<ReadlistPage />);

    await waitFor(() => screen.getByText("Apagar readlist"));

    // abrir popup
    fireEvent.click(screen.getByText("Apagar readlist"));

    // clicar no botão do mock que executa delete
    await act(async () => {
    fireEvent.click(screen.getByTestId("confirm-delete"));
    });

    // testou realmente se a API foi chamada
    expect(deleteReadlist).toHaveBeenCalledWith("minha-readlist");
  });
});