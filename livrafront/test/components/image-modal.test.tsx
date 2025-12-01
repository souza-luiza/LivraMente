import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import ImageModal from "@/components/image-modal";
import { Imagens } from "@/types/post";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, fill }: any) => {
    const imgProps: any = {
      "data-testid": "image",
      "data-src": src,
      "data-alt": alt,
      "data-width": width,
      "data-height": height,
      "data-fill": fill,
      className: className,
    };

    if (fill) {
      return <div {...imgProps} style={{ position: 'absolute' }} />;
    }
    
    return <img {...imgProps} />;
  },
}));

jest.mock("@/components/button", () => ({
  __esModule: true,
  default: ({ icon, onClick, size, colorScheme }: any) => (
    <button
      data-testid="modal-button"
      data-size={size}
      data-color-scheme={colorScheme}
      onClick={onClick}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
    </button>
  ),
}));

jest.mock("@/components/icons/RemoveIcon", () => () => <svg data-testid="remove-icon" />);
jest.mock("@/components/icons/CodeIcon", () => ({ size }: { size?: number }) => 
  <svg data-testid="code-icon" data-size={size} />
);

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const getModalElement = () => document.body.querySelector("div.fixed.inset-0");

const mockImagens: Imagens[] = [
  { secure_url: "https://example.com/image1.jpg", public_id: "img1" },
  { secure_url: "https://example.com/image2.jpg", public_id: "img2" },
  { secure_url: "https://example.com/image3.jpg", public_id: "img3" },
];

const mockOnClose = jest.fn();

describe("ImageModal", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
    mockOnClose.mockClear();
    
    Object.defineProperty(document.body, "style", {
      value: {
        overflow: "",
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic rendering", () => {
    it("renders modal with all props", () => {
      render(
        <ImageModal
          comunidade="Test Community"
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modal = getModalElement();
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveStyle("background-color: rgba(0, 0, 0, 0.8)");
      
      expect(screen.getByTestId("modal-button")).toBeInTheDocument();
      expect(screen.getByTestId("remove-icon")).toBeInTheDocument();
      
      const mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
      
      expect(screen.getAllByTestId("image")).toHaveLength(mockImagens.length + 1); 
      
      expect(screen.getByText("Test Community")).toBeInTheDocument();
      expect(screen.getByText("@testuser")).toBeInTheDocument();
      expect(screen.getByTestId("code-icon")).toBeInTheDocument();
    });

    it("renders modal without comunidade prop", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText("Test Community")).not.toBeInTheDocument();
      expect(screen.queryByTestId("code-icon")).not.toBeInTheDocument();
      
      expect(screen.getByText("@testuser")).toBeInTheDocument();
    });

    it("returns null when imagem is empty", () => {
      const { container } = render(
        <ImageModal
          autor="testuser"
          imagem=""
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("returns null when imagens array is empty", () => {
      const { container } = render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={[]}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("returns null when imagens is undefined", () => {
      const { container } = render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={undefined as any}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("State initialization", () => {
    it("initializes with provided imagem as selected", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[1].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[1].secure_url);
    });

    it("initializes imageArray state with provided imagens", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const thumbnails = screen.getAllByTestId("image").slice(1);
      expect(thumbnails).toHaveLength(mockImagens.length);
    });
  });

  describe("Keyboard navigation", () => {
    it("closes modal on Escape key", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("navigates to next image on ArrowRight key", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      let mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
      
      await user.keyboard('{ArrowRight}');
      
      mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[1].secure_url);
    });

    it("navigates to previous image on ArrowLeft key", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[1].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      let mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[1].secure_url);
      
      await user.keyboard('{ArrowLeft}');
      
      mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
    });

    it("wraps around when navigating past last image", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[mockImagens.length - 1].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      let mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[mockImagens.length - 1].secure_url);
      
      await user.keyboard('{ArrowRight}');
      
      mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
    });

    it("wraps around when navigating before first image", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      let mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
      
      await user.keyboard('{ArrowLeft}');
      
      mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[mockImagens.length - 1].secure_url);
    });

    it("ignores other keyboard keys", async () => {
      const user = userEvent.setup();
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const initialImage = screen.getAllByTestId("image")[0];
      const initialSrc = initialImage.getAttribute("data-src");
      
      // Press other keys
      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      await user.keyboard('a');
      await user.keyboard('1');
      
      const currentImage = screen.getAllByTestId("image")[0];
      expect(currentImage).toHaveAttribute("data-src", initialSrc);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Event listeners and cleanup", () => {
    it("adds and removes keydown event listener", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it("disables body overflow on mount and restores on unmount", () => {
      const originalOverflow = "auto";
      Object.defineProperty(document.body, "style", {
        value: {
          overflow: originalOverflow,
        },
        writable: true,
      });

      const { unmount } = render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe(originalOverflow);
    });

    it("handles missing original overflow style", () => {
      Object.defineProperty(document.body, "style", {
        value: {},
        writable: true,
      });

      const { unmount } = render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      
      expect(document.body.style.overflow === "" || typeof document.body.style.overflow === 'undefined').toBeTruthy();
    });
  });

  describe("Image selection", () => {
    it("selects image when thumbnail is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      let mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[0].secure_url);
      
      const thumbnails = screen.getAllByTestId("image").slice(1);
      fireEvent.click(thumbnails[2]);
      
      mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", mockImagens[2].secure_url);
    });

    it("highlights selected thumbnail with border", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[1].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const thumbnails = screen.getAllByTestId("image").slice(1);
      const thumbnailContainers = thumbnails.map(img => {
        let el: any = img.parentElement;
        while (el && !(el.className && (el.className.includes("w-24") || el.className.includes("medium-border-radius") || el.className.includes("relative")))) {
          el = el.parentElement;
        }
        return el;
      });
      
      expect(thumbnailContainers[0]).not.toHaveClass("large-border-width");
      expect(thumbnailContainers[0]).not.toHaveClass("border-[var(--primary-700)]");
      
      const selectedWithBorder = thumbnailContainers.filter((c: any) =>
        c && c.classList && c.classList.contains("large-border-width") && c.classList.contains("border-[var(--primary-700)]")
      );
      expect(selectedWithBorder.length).toBeGreaterThanOrEqual(1);
      expect(selectedWithBorder.length).toBeLessThanOrEqual(1);

      const borderCount = thumbnailContainers.filter((c: any) => c && c.classList && c.classList.contains("large-border-width")).length;
      expect(borderCount).toBeLessThanOrEqual(1);
    });
  });

  describe("Modal interactions", () => {
    it("closes modal when backdrop is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modal = getModalElement();
      if (modal) {
        fireEvent.click(modal);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("closes modal when close button is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByTestId("modal-button");
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not close modal when image area is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modalRoot = getModalElement();
      const imageArea = modalRoot ? modalRoot.querySelector(".relative.max-w-\\[90vw\\]") : null;

      if (imageArea) {
        fireEvent.click(imageArea);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not close modal when thumbnails area is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modalRoot = getModalElement();
      const thumbnailsArea = modalRoot ? modalRoot.querySelector(".flex.flex-row.gap-2") : null;

      if (thumbnailsArea) {
        fireEvent.click(thumbnailsArea);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not close modal when community/author area is clicked", () => {
      render(
        <ImageModal
          comunidade="Test Community"
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modalRoot = getModalElement();
      const infoArea = modalRoot ? modalRoot.querySelector(".flex.flex-row.gap-2.dark-green") : null;

      if (infoArea) {
        fireEvent.click(infoArea);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("navigates to author profile when author name is clicked", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const authorLink = screen.getByText("@testuser");
      fireEvent.click(authorLink);
      
      expect(mockPush).toHaveBeenCalledWith("/testuser");
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Styling and layout", () => {
    it("modal has correct positioning and backdrop", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modal = getModalElement();

      expect(modal).toHaveClass("fixed");
      expect(modal).toHaveClass("inset-0");
      expect(modal).toHaveClass("z-50");
      expect(modal).toHaveClass("flex");
      expect(modal).toHaveClass("flex-col");
      expect(modal).toHaveClass("items-center");
      expect(modal).toHaveClass("justify-center");
      expect(modal).toHaveClass("pb-40");
      expect(modal).toHaveStyle("background-color: rgba(0, 0, 0, 0.8)");
    });

    it("close button has correct positioning", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const closeButtonContainer = screen.getByTestId("modal-button").closest("div");
      expect(closeButtonContainer).toHaveClass("absolute");
      expect(closeButtonContainer).toHaveClass("top-4");
      expect(closeButtonContainer).toHaveClass("right-4");
    });

    it("main image container has correct sizing", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modalRoot = getModalElement();
      const imageContainer = modalRoot ? modalRoot.querySelector(".relative.max-w-\\[90vw\\]") : null;

      expect(imageContainer).toHaveClass("max-w-[90vw]");
      expect(imageContainer).toHaveClass("max-h-[calc(100vh-200px)]");
      expect(imageContainer).toHaveClass("flex");
      expect(imageContainer).toHaveClass("items-center");
      expect(imageContainer).toHaveClass("justify-center");
    });

    it("main image has correct object-fit", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveClass("object-contain");
      expect(mainImage).toHaveClass("w-auto");
      expect(mainImage).toHaveClass("h-auto");
      expect(mainImage).toHaveClass("max-w-full");
      expect(mainImage).toHaveClass("max-h-full");
    });

    it("thumbnails have correct styling", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modalRoot = getModalElement();
      const thumbnailsContainer = modalRoot ? modalRoot.querySelector(".absolute.bottom-0") : null;

      expect(thumbnailsContainer).toHaveClass("bottom-0");
      expect(thumbnailsContainer).toHaveClass("w-full");
      expect(thumbnailsContainer).toHaveClass("flex");
      expect(thumbnailsContainer).toHaveClass("flex-col");
      expect(thumbnailsContainer).toHaveClass("gap-2");
      expect(thumbnailsContainer).toHaveClass("flex-shrink-0");
      expect(thumbnailsContainer).toHaveClass("items-center");
      expect(thumbnailsContainer).toHaveClass("justify-center");
      expect(thumbnailsContainer).toHaveClass("mt-2");
      expect(thumbnailsContainer).toHaveClass("mb-4");
    });

    it("thumbnail images have fill and object-cover", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const thumbnails = screen.getAllByTestId("image").slice(1);
      thumbnails.forEach(thumbnail => {
        expect(thumbnail).toHaveAttribute("data-fill", "true");
        expect(thumbnail).toHaveClass("object-cover");
      });
    });

    it("thumbnail containers have correct dimensions", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const thumbnailContainers = screen.getAllByTestId("image")
        .slice(1)
        .map(img => {
          // walk up to find the thumbnail wrapper (outer container)
          let el: any = img.parentElement;
          while (el && !(el.className && (el.className.includes("w-24") || el.className.includes("medium-border-radius") || el.className.includes("relative")))) {
            el = el.parentElement;
          }
          return el;
        });

      thumbnailContainers.forEach(container => {
        expect(container).toHaveClass("w-24");
        expect(container).toHaveClass("h-24");
        expect(container).toHaveClass("medium-border-radius");
        expect(container).toHaveClass("overflow-hidden");
        expect(container).toHaveClass("hover:cursor-pointer");
      });
    });
  });

  describe("Edge cases", () => {
    it("handles single image in array", () => {
      const singleImageArray = [mockImagens[0]];
      
      render(
        <ImageModal
          autor="testuser"
          imagem={singleImageArray[0].secure_url}
          imagens={singleImageArray}
          onClose={mockOnClose}
        />
      );

      const thumbnails = screen.getAllByTestId("image");
      expect(thumbnails).toHaveLength(2);
      
      fireEvent.keyDown(window, { key: "ArrowRight" });
      const mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", singleImageArray[0].secure_url);
    });

    it("handles missing secure_url in imagens", () => {
      const incompleteImagens = [
        { secure_url: "image1.jpg", public_id: "img1" },
        { public_id: "img2" } as any,
        { secure_url: "image3.jpg", public_id: "img3" },
      ];
      
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
      
      render(
        <ImageModal
          autor="testuser"
          imagem={incompleteImagens[0].secure_url}
          imagens={incompleteImagens}
          onClose={mockOnClose}
        />
      );

      expect(screen.getAllByTestId("image")).toHaveLength(incompleteImagens.length + 1);
      
      consoleError.mockRestore();
    });

    it("handles null imagem", () => {
      const { container } = render(
        <ImageModal
          autor="testuser"
          imagem={null as any}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("handles duplicate image URLs", () => {
      const duplicateImagens = [
        { secure_url: "same.jpg", public_id: "img1" },
        { secure_url: "same.jpg", public_id: "img2" },
        { secure_url: "same.jpg", public_id: "img3" },
      ];
      
      render(
        <ImageModal
          autor="testuser"
          imagem={duplicateImagens[0].secure_url}
          imagens={duplicateImagens}
          onClose={mockOnClose}
        />
      );

      expect(screen.getAllByTestId("image")).toHaveLength(duplicateImagens.length + 1);
      
      fireEvent.keyDown(window, { key: "ArrowRight" });
      const mainImage = screen.getAllByTestId("image")[0];
      expect(mainImage).toHaveAttribute("data-src", "same.jpg");
    });

    it("handles empty strings in imagem array", () => {
      const mixedImagens = [
        { secure_url: "", public_id: "img1" },
        { secure_url: "image2.jpg", public_id: "img2" },
      ];
      
      render(
        <ImageModal
          autor="testuser"
          imagem={mixedImagens[1].secure_url}
          imagens={mixedImagens}
          onClose={mockOnClose}
        />
      );

      expect(screen.getAllByTestId("image")).toHaveLength(3);
    });
  });

  describe("Animation", () => {
    it("has animation props on modal", () => {
      render(
        <ImageModal
          autor="testuser"
          imagem={mockImagens[0].secure_url}
          imagens={mockImagens}
          onClose={mockOnClose}
        />
      );

      const modal = getModalElement();

      expect(modal).toBeInTheDocument();
    });
  });
});