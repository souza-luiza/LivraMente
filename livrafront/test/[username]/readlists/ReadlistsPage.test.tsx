import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import { getSessionInfos } from "@/services/auth";
import { getOwnReadlists, getPublicReadlists, getFavoriteReadlists } from "@/services/readlists";
import ReadlistsPage from "@/app/[username]/readlists/page";

// Mocking services and Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),  // Mock de useParams
}));

jest.mock("@/services/auth", () => ({
  getSessionInfos: jest.fn(),
}));

jest.mock("@/services/readlists", () => ({
  getOwnReadlists: jest.fn(),
  getPublicReadlists: jest.fn(),
  getFavoriteReadlists: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("ReadlistsPage", () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should display readlists when user is the owner", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue({ username: "testUser" });
    (getOwnReadlists as jest.Mock).mockResolvedValue([
      { _id: "1", nome: "My Readlist", slug: "my-readlist" },
    ]);
    (getFavoriteReadlists as jest.Mock).mockResolvedValue([]);

    // Mocking useParams to simulate the "username" parameter
    (useParams as jest.Mock).mockReturnValue({ username: "testUser" });

    render(<ReadlistsPage />);

    await waitFor(() => {
      expect(screen.getByText("My Readlist")).toBeInTheDocument();
    });

    expect(screen.getByText("Criar readlist")).toBeInTheDocument();
  });

  it("should redirect to login page if no session is found", async () => {
    (getSessionInfos as jest.Mock).mockResolvedValue(null);

    // Mocking useParams to simulate the "username" parameter
    (useParams as jest.Mock).mockReturnValue({ username: "testUser" });

    render(<ReadlistsPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/entrar");
    });
  });

  it("should display an error message if there's an error fetching readlists", async () => {
    const { toast } = require('react-toastify');
    (getSessionInfos as jest.Mock).mockResolvedValue({ username: "testUser" });
    (getOwnReadlists as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    // Mocking useParams to simulate the "username" parameter
    (useParams as jest.Mock).mockReturnValue({ username: "testUser" });

    render(<ReadlistsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar readlists do usuário.");
    });
  });
});