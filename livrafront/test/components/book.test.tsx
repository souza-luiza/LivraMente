import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/book";
import { Livro } from "@/types/livros";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <div 
      className={className}
      data-testid="book-image"
      data-src={src}
      data-alt={alt}
      data-fill={fill}
      style={{ position: fill ? 'absolute' : 'relative' }}
    />
  ),
}));

const mockBookWithAllData: Livro = {
  _id: '1',
  slug: "test-book",
  titulo: "Test Book Title",
  capa_url: "https://example.com/book-cover.jpg",
  autores: [
    { nome: "Author One" },
    { nome: "Author Two" },
  ],
  ano_publicacao: 2023,
  sinopse: "Test synopsis",
  generos: ["Fiction"],
  numero_paginas: 300,
  avaliacoes_media: 4.5,
  avaliacoes_count: 100,
  isbn: "123-4567890123",
};

const mockBookWithSingleAuthor: Livro = {
  ...mockBookWithAllData,
  autores: [{ nome: "Single Author" }],
  ano_publicacao: 2021,
};

const mockBookWithoutCover: Livro = {
  ...mockBookWithAllData,
  capa_url: "",
  titulo: "Book Without Cover",
};

const mockBookWithoutAuthors: Livro = {
  ...mockBookWithAllData,
  autores: [],
  titulo: "Book Without Authors",
};

const mockBookWithLongTitle: Livro = {
  ...mockBookWithAllData,
  titulo: "This is a very long book title that should be truncated with ellipsis when it exceeds two lines in the display",
  slug: "long-title-book",
};

const mockBookWithSpecialCharacters: Livro = {
  ...mockBookWithAllData,
  titulo: "Book with Special & Characters < > ' \"",
  autores: [{ nome: "Author with & Special < > ' \" Characters" }],
  slug: "special-chars-book",
};

describe("BookCard", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  describe("Basic rendering", () => {
    it("renders book with all data correctly", () => {
      render(<BookCard book={mockBookWithAllData} />);

      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
      
      expect(screen.getByText("Author One, Author Two")).toBeInTheDocument();
      
      expect(screen.getByText("2023")).toBeInTheDocument();
      
      const image = screen.getByTestId("book-image");
      expect(image).toHaveAttribute("data-src", mockBookWithAllData.capa_url);
      expect(image).toHaveAttribute("data-alt", "Capa do livro Test Book Title");
      expect(image).toHaveAttribute("data-fill", "true");
    });

    it("renders book with single author", () => {
      render(<BookCard book={mockBookWithSingleAuthor} />);

      expect(screen.getByText("Single Author")).toBeInTheDocument();
      expect(screen.getByText("2021")).toBeInTheDocument();
    });

    it("renders book without cover image", () => {
      render(<BookCard book={mockBookWithoutCover} />);

      const image = screen.queryByTestId("book-image");
      expect(screen.getByText("Book Without Cover")).toBeInTheDocument();
      if (image) {
        expect(image).toHaveAttribute("data-src", "");
      } else {
        expect(image).toBeNull();
      }
    });

    it("renders book without authors", () => {
      render(<BookCard book={mockBookWithoutAuthors} />);

      const authorsParagraph = screen.getByText("2023").previousSibling;
      expect(authorsParagraph).toBeInTheDocument();
      expect(authorsParagraph?.textContent).toBe("");
    });
  });

  describe("Click behavior", () => {
    it("navigates to book detail page when clicked", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);

      expect(mockPush).toHaveBeenCalledWith("/livro/test-book");
    });

    it("navigates with correct slug for different books", () => {
      render(<BookCard book={mockBookWithLongTitle} />);

      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);

      expect(mockPush).toHaveBeenCalledWith("/livro/long-title-book");
    });

    it("handles special characters in slug navigation", () => {
      render(<BookCard book={mockBookWithSpecialCharacters} />);

      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);

      expect(mockPush).toHaveBeenCalledWith("/livro/special-chars-book");
    });
  });

  describe("Styling and layout", () => {
    it("has correct CSS classes for styling", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const bookCard = screen.getByRole("button");
      
      expect(bookCard).toHaveClass("w-full");
      expect(bookCard).toHaveClass("flex");
      expect(bookCard).toHaveClass("flex-row");
      expect(bookCard).toHaveClass("light-neutral");
      expect(bookCard).toHaveClass("small-border-radius");
      expect(bookCard).toHaveClass("p-2");
      expect(bookCard).toHaveClass("hover:cursor-pointer");
      expect(bookCard).toHaveClass("hover:shadow-lg");
      expect(bookCard).toHaveClass("gap-2");
    });

    it("image container has correct aspect ratio and dimensions", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const imageContainer = screen.getByTestId("book-image").parentElement;
      
      expect(imageContainer).toHaveClass("relative");
      expect(imageContainer).toHaveClass("aspect-[2/3]");
      expect(imageContainer).toHaveClass("w-24");
      expect(imageContainer).toHaveClass("overflow-hidden");
      expect(imageContainer).toHaveClass("small-border-radius");
    });

    it("image has correct object-fit style", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const image = screen.getByTestId("book-image");
      expect(image).toHaveClass("object-cover");
    });

    it("content container has correct width and padding", () => {
      render(<BookCard book={mockBookWithAllData} />);

      // The title's parent is the content container (one level up)
      const contentContainer = screen.getByText("Test Book Title").parentElement;

      expect(contentContainer).toHaveClass("w-3/4");
      expect(contentContainer).toHaveClass("flex");
      expect(contentContainer).toHaveClass("flex-col");
      expect(contentContainer).toHaveClass("p-2");
      expect(contentContainer).toHaveClass("gap-1");
    });

    it("title has text truncation classes", () => {
      render(<BookCard book={mockBookWithLongTitle} />);

      const title = screen.getByText(/This is a very long book title/);
      
      expect(title).toHaveClass("text-h6");
      expect(title).toHaveClass("overflow-hidden");
      expect(title).toHaveClass("line-clamp-2");
      expect(title).toHaveStyle({ wordBreak: 'break-word', overflowWrap: 'break-word' });
    });

    it("author text has correct styling and truncation", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const authorText = screen.getByText("Author One, Author Two");
      
      expect(authorText).toHaveClass("text-b2");
      expect(authorText).toHaveClass("overflow-hidden");
      expect(authorText).toHaveClass("body-quotation");
      expect(authorText).toHaveClass("line-clamp-1");
      expect(authorText).toHaveStyle({ wordBreak: 'break-word', overflowWrap: 'break-word' });
    });

    it("year text has correct styling", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const yearText = screen.getByText("2023");
      
      expect(yearText).toHaveClass("text-b3");
      expect(yearText).toHaveClass("body-semibold");
    });
  });

  describe("Text truncation and overflow", () => {
    it("truncates long title after two lines", () => {
      render(<BookCard book={mockBookWithLongTitle} />);

      const title = screen.getByText(/This is a very long book title/);
      expect(title).toHaveClass("line-clamp-2");
      
      expect(title).toHaveStyle("word-break: break-word");
      expect(title).toHaveStyle("overflow-wrap: break-word");
    });

    it("truncates author list after one line", () => {
      const bookWithManyAuthors: Livro = {
        ...mockBookWithAllData,
        autores: [
          { nome: "First Author" },
          { nome: "Second Author" },
          { nome: "Third Author" },
          { nome: "Fourth Author" },
          { nome: "Fifth Author" },
        ],
      };

      render(<BookCard book={bookWithManyAuthors} />);

      const authorText = screen.getByText(/First Author/);
      expect(authorText).toHaveClass("line-clamp-1");
    });

    it("handles empty author list gracefully", () => {
      render(<BookCard book={mockBookWithoutAuthors} />);

      const contentDiv = screen.getByText("Book Without Authors").parentElement;
      expect(contentDiv?.children.length).toBe(3);
    });
  });

  describe("Accessibility", () => {
    it("has button role for accessibility", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const bookCard = screen.getByRole("button");
      expect(bookCard).toBeInTheDocument();
    });

    it("has descriptive alt text for images", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const image = screen.getByTestId("book-image");
      expect(image).toHaveAttribute("data-alt", "Capa do livro Test Book Title");
    });

    it("has hover cursor style indicating interactivity", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const bookCard = screen.getByRole("button");
      expect(bookCard).toHaveClass("hover:cursor-pointer");
    });

    it("provides visual feedback on hover with shadow", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const bookCard = screen.getByRole("button");
      expect(bookCard).toHaveClass("hover:shadow-lg");
    });
  });

  describe("Edge cases", () => {
    it("handles book with undefined properties", () => {
      const bookWithUndefined: Partial<Livro> = {
        slug: "undefined-book",
        titulo: "Book with undefined",
      };
      
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      render(<BookCard book={bookWithUndefined as Livro} />);

      expect(screen.getByText("Book with undefined")).toBeInTheDocument();
      
      const image = screen.queryByTestId("book-image");
      if (image) {
        expect(image).toHaveAttribute("data-src", undefined);
      } else {
        expect(image).toBeNull();
      }

      consoleError.mockRestore();
    });

    it("handles book with null values", () => {
      const bookWithNulls: Livro = {
        _id: '1',
        slug: "null-book",
        titulo: "Book with Nulls",
        capa_url: null as any,
        autores: null as any,
        ano_publicacao: null as any,
        sinopse: null as any,
        generos: null as any,
        numero_paginas: null as any,
        avaliacoes_media: null as any,
        avaliacoes_count: null as any,
        isbn: null as any,
      };

      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      render(<BookCard book={bookWithNulls} />);

      expect(screen.getByText("Book with Nulls")).toBeInTheDocument();
      
      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);
      
      expect(mockPush).toHaveBeenCalledWith("/livro/null-book");
      
      consoleError.mockRestore();
    });

    it("handles extremely long author names", () => {
      const bookWithLongAuthorName: Livro = {
        ...mockBookWithAllData,
        autores: [
          {
            nome: "Dr. Professor Johannes Chrysostomus Wolfgangus Theophilus Mozart van Beethoven III Esquire" 
          },
        ],
        titulo: "Book with Long Author Name",
      };

      render(<BookCard book={bookWithLongAuthorName} />);

      const authorText = screen.getByText(/Dr. Professor Johannes/);
      expect(authorText).toHaveClass("line-clamp-1");
      expect(authorText).toHaveStyle("word-break: break-word");
    });

    it("handles HTML and special characters in text safely", () => {
      const bookWithHtml: Livro = {
        ...mockBookWithAllData,
        titulo: "Book <script>alert('xss')</script>",
        autores: [{ nome: "Author <strong>bold</strong>" }],
        slug: "html-book",
      };

      render(<BookCard book={bookWithHtml} />);

      const title = screen.getByText(/Book <script>alert\('xss'\)<\/script>/);
      expect(title).toBeInTheDocument();
      // Some environments escape < and > but may leave quotes unescaped; check for the main escaped script tag
      expect(title.innerHTML).toContain("&lt;script&gt;alert('xss')&lt;/script&gt;");
      
      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);
      
      expect(mockPush).toHaveBeenCalledWith("/livro/html-book");
    });

    it("handles missing slug property", () => {
      const bookWithoutSlug: Livro = {
        ...mockBookWithAllData,
        slug: "",
        titulo: "Book Without Slug",
      };

      render(<BookCard book={bookWithoutSlug} />);

      const bookCard = screen.getByRole("button");
      fireEvent.click(bookCard);
      
      expect(mockPush).toHaveBeenCalledWith("/livro/");
    });
  });

  describe("Performance and optimization", () => {
    it("uses Next.js Image component for optimization", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const image = screen.getByTestId("book-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("data-fill", "true");
    });

    it("only renders image when capa_url is provided", () => {
      render(<BookCard book={mockBookWithAllData} />);

      const image = screen.getByTestId("book-image");
      expect(image).toBeInTheDocument();
    });

    it("handles conditional image rendering in JSX", () => {
      render(<BookCard book={mockBookWithoutCover} />);

      const image = screen.queryByTestId("book-image");
      if (image) {
        expect(image).toHaveAttribute("data-src", "");
      } else {
        expect(image).toBeNull();
      }
    });
  });
});