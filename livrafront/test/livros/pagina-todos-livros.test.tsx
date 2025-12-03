import React from 'react';
import { render, screen, fireEvent, waitFor, act, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LivrosPage from '@/app/livros/page';
import { livrosService } from '@/services/livros';
import { toast } from 'react-toastify';

jest.mock('@/services/livros');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/components/icons/FilterIcon', () => () => <div data-testid="filter-icon">FilterIcon</div>);
jest.mock('@/components/icons/ClockIcon', () => () => <div data-testid="clock-icon">ClockIcon</div>);
jest.mock('@/components/icons/PillarIcon', () => () => <div data-testid="pillar-icon">PillarIcon</div>);
jest.mock('@/components/icons/ArrowUpIcon', () => () => <div data-testid="arrow-up-icon">ArrowUpIcon</div>);

jest.mock('@/components/sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('@/components/searchbar', () => () => <div data-testid="searchbar">SearchBar</div>);
jest.mock('@/components/filter', () => ({ filters, currentFilter, onChange, colorScheme }: any) => (
  <div data-testid="dropdown-filter">
    <select 
      data-testid="filter-select"
      value={currentFilter}
      onChange={(e) => onChange(e.target.value)}
    >
      {filters.map((filter: string) => (
        <option key={filter} value={filter}>{filter}</option>
      ))}
    </select>
    <span>{colorScheme}</span>
  </div>
));
jest.mock('@/components/loading', () => () => <div data-testid="loading">Loading...</div>);
jest.mock('@/components/toast-notification', () => () => <div data-testid="toast-notification">ToastNotification</div>);
jest.mock('@/components/book', () => ({ book }: any) => (
  <div data-testid={`book-${book._id}`}>
    <h3>{book.titulo}</h3>
    <p>{book.autores?.[0]?.nome || 'Autor desconhecido'}</p>
    <p>{book.ano_publicacao}</p>
  </div>
));
jest.mock('@/components/button', () => ({ text, icon, size, colorScheme, onClick }: any) => (
  <button 
    data-testid="scroll-top-button"
    onClick={onClick}
    className={`${size} ${colorScheme}`}
  >
    {icon} {text}
  </button>
));

const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LivrosPage', () => {
  const mockBooks = [
    {
      _id: '1',
      titulo: 'Dom Quixote',
      autores: [{ nome: 'Miguel de Cervantes' }],
      ano_publicacao: 1605,
    },
    {
      _id: '2',
      titulo: '1984',
      autores: [{ nome: 'George Orwell' }],
      ano_publicacao: 1949,
    },
    {
      _id: '3',
      titulo: 'A Revolução dos Bichos',
      autores: [{ nome: 'George Orwell' }],
      ano_publicacao: 1945,
    },
    {
      _id: '4',
      titulo: 'Cem Anos de Solidão',
      autores: [{ nome: 'Gabriel García Márquez' }],
      ano_publicacao: 1967,
    },
  ];

  const mockBooksWithMissingAuthor = [
    {
      _id: '5',
      titulo: 'Livro sem Autor',
      autores: [],
      ano_publicacao: 2000,
    },
  ];

  const mockBooksEmpty: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering and data fetching', () => {
    it('deve mostrar loading inicialmente', () => {
      (livrosService.getBooks as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      render(<LivrosPage />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByText('Livros')).not.toBeInTheDocument();
    });

    it('deve carregar e exibir livros com sucesso', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      
      render(<LivrosPage />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText('Livros')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('searchbar')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-filter')).toBeInTheDocument();
      
      mockBooks.forEach(book => {
        const bookEl = screen.getByTestId(`book-${book._id}`);
        expect(bookEl).toBeInTheDocument();
        expect(within(bookEl).getByText(book.titulo)).toBeInTheDocument();
        expect(within(bookEl).getByText(book.autores[0].nome)).toBeInTheDocument();
      });
    });

    it('deve lidar com erro ao carregar livros', async () => {
      (livrosService.getBooks as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar livros.');
      expect(screen.getByText('Livros')).toBeInTheDocument();
    });

    it('deve ordenar livros A-Z por título inicialmente', async () => {
      const unsortedBooks = [
        { _id: '1', titulo: 'Zebra', autores: [{ nome: 'Autor A' }], ano_publicacao: 2000 },
        { _id: '2', titulo: 'Abacaxi', autores: [{ nome: 'Autor B' }], ano_publicacao: 1990 },
        { _id: '3', titulo: 'Maçã', autores: [{ nome: 'Autor C' }], ano_publicacao: 2010 },
      ];
      
      (livrosService.getBooks as jest.Mock).mockResolvedValue(unsortedBooks);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const bookElements = screen.getAllByTestId(/book-/);
      expect(bookElements[0]).toHaveTextContent('Abacaxi');
      expect(bookElements[1]).toHaveTextContent('Maçã');
      expect(bookElements[2]).toHaveTextContent('Zebra');
    });

    it('deve lidar com lista vazia de livros', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooksEmpty);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText('Livros')).toBeInTheDocument();
      expect(screen.queryByTestId(/book-/)).not.toBeInTheDocument();
    });
  });

  describe('Filter functionality', () => {
    beforeEach(async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('deve renderizar filtros corretamente', () => {
      const filterSelect = screen.getByTestId('filter-select');
      expect(filterSelect).toBeInTheDocument();
      expect(filterSelect).toHaveValue('A-Z Título');
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(6);
      expect(options[0]).toHaveTextContent('A-Z Título');
      expect(options[1]).toHaveTextContent('Z-A Título');
      expect(options[2]).toHaveTextContent('A-Z Autor');
      expect(options[3]).toHaveTextContent('Z-A Autor');
      expect(options[4]).toHaveTextContent('Mais Recentes');
      expect(options[5]).toHaveTextContent('Mais Antigos');
    });

    it('deve ordenar Z-A por título', async () => {
      const filterSelect = screen.getByTestId('filter-select');
      
      fireEvent.change(filterSelect, { target: { value: 'Z-A Título' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const firstBookTitle = bookElements[0].querySelector('h3')?.textContent;
        expect(firstBookTitle).toBe('Dom Quixote'); 
      });
    });

    it('deve ordenar A-Z por autor', async () => {
      const filterSelect = screen.getByTestId('filter-select');
      
      fireEvent.change(filterSelect, { target: { value: 'A-Z Autor' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const authors = bookElements.map(el => el.querySelector('p')?.textContent);
        expect(authors[0]).toBe('Gabriel García Márquez');
        expect(authors[1]).toBe('George Orwell');
        expect(authors[2]).toBe('George Orwell');
        expect(authors[3]).toBe('Miguel de Cervantes');
      });
    });

    it('deve ordenar Z-A por autor', async () => {
      const filterSelect = screen.getByTestId('filter-select');
      
      fireEvent.change(filterSelect, { target: { value: 'Z-A Autor' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const authors = bookElements.map(el => el.querySelector('p')?.textContent);
        expect(authors[0]).toBe('Miguel de Cervantes');
        expect(authors[1]).toBe('George Orwell');
        expect(authors[2]).toBe('George Orwell');
        expect(authors[3]).toBe('Gabriel García Márquez');
      });
    });

    it('deve ordenar por mais recentes', async () => {
      const filterSelect = screen.getByTestId('filter-select');
      
      fireEvent.change(filterSelect, { target: { value: 'Mais Recentes' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const years = bookElements.map(el => {
          const yearText = el.querySelectorAll('p')[1]?.textContent;
          return yearText ? parseInt(yearText) : 0;
        });
        expect(years[0]).toBe(1967);
        expect(years[1]).toBe(1949);
        expect(years[2]).toBe(1945);
        expect(years[3]).toBe(1605);
      });
    });

    it('deve ordenar por mais antigos', async () => {
      const filterSelect = screen.getByTestId('filter-select');
      
      fireEvent.change(filterSelect, { target: { value: 'Mais Antigos' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const years = bookElements.map(el => {
          const yearText = el.querySelectorAll('p')[1]?.textContent;
          return yearText ? parseInt(yearText) : 0;
        });
        expect(years[0]).toBe(1605);
        expect(years[1]).toBe(1945);
        expect(years[2]).toBe(1949);
        expect(years[3]).toBe(1967);
      });
    });

    it('deve lidar com livros sem autor definido', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooksWithMissingAuthor);
      // ensure previous render (from describe beforeEach) is unmounted before rendering new data
      cleanup();
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const filterSelect = screen.getByTestId('filter-select');
      fireEvent.change(filterSelect, { target: { value: 'A-Z Autor' } });
      
      await waitFor(() => {
        expect(screen.getByText('Autor desconhecido')).toBeInTheDocument();
      });
    });
  });

  describe('Scroll behavior', () => {
    beforeEach(async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('não deve mostrar botão de voltar ao topo inicialmente', () => {
      expect(screen.queryByTestId('scroll-top-button')).not.toBeInTheDocument();
    });

    it('deve mostrar botão de voltar ao topo quando scrolado', () => {
      const mockGetBoundingClientRect = jest.fn();
      mockGetBoundingClientRect.mockReturnValue({ bottom: -10 });
      const headerElement = { getBoundingClientRect: mockGetBoundingClientRect };
      
      jest.spyOn(document, 'querySelector').mockReturnValue(headerElement as any);
      
      fireEvent.scroll(window);
      
      expect(screen.getByTestId('scroll-top-button')).toBeInTheDocument();
      expect(screen.getByText('Voltar ao Topo')).toBeInTheDocument();
    });

    it('deve esconder botão de voltar ao topo quando no topo', () => {
      const mockGetBoundingClientRect = jest.fn();
      mockGetBoundingClientRect.mockReturnValue({ bottom: -10 });
      const headerElement = { getBoundingClientRect: mockGetBoundingClientRect };
      jest.spyOn(document, 'querySelector').mockReturnValue(headerElement as any);
      fireEvent.scroll(window);
      
      expect(screen.getByTestId('scroll-top-button')).toBeInTheDocument();
      
      mockGetBoundingClientRect.mockReturnValue({ bottom: 100 });
      fireEvent.scroll(window);
      
      expect(screen.queryByTestId('scroll-top-button')).not.toBeInTheDocument();
    });

    it('deve fazer scroll para o topo ao clicar no botão', () => {
      window.scrollTo = jest.fn();
      
      const mockGetBoundingClientRect = jest.fn();
      mockGetBoundingClientRect.mockReturnValue({ bottom: -10 });
      const headerElement = { getBoundingClientRect: mockGetBoundingClientRect };
      jest.spyOn(document, 'querySelector').mockReturnValue(headerElement as any);
      fireEvent.scroll(window);
      
      const button = screen.getByTestId('scroll-top-button');
      fireEvent.click(button);
      
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('deve remover event listener ao desmontar', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<LivrosPage />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('deve lidar com querySelector retornando null', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      jest.spyOn(document, 'querySelector').mockReturnValue(null);
      
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      fireEvent.scroll(window);
      expect(screen.queryByTestId('scroll-top-button')).not.toBeInTheDocument();
    });

    it('deve manter ordenação quando filtro não reconhecido', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const originalBooks = [...mockBooks].sort((a, b) => 
        a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase())
      );
      
      const { container } = render(<LivrosPage />);
      const filterSelect = screen.getByTestId('filter-select');
      expect(filterSelect).toHaveValue('A-Z Título');
    });

    it('deve lidar com livros com títulos em maiúsculas/minúsculas misturadas', async () => {
      const mixedCaseBooks = [
        { _id: '1', titulo: 'DOM QUIXOTE', autores: [{ nome: 'Autor A' }], ano_publicacao: 1605 },
        { _id: '2', titulo: 'dom quixote', autores: [{ nome: 'Autor B' }], ano_publicacao: 1605 },
        { _id: '3', titulo: 'Dom Quixote', autores: [{ nome: 'Autor C' }], ano_publicacao: 1605 },
      ];
      
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mixedCaseBooks);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const filterSelect = screen.getByTestId('filter-select');
      fireEvent.change(filterSelect, { target: { value: 'A-Z Título' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        expect(bookElements).toHaveLength(3);
      });
    });

    it('deve preservar ordem original quando anos de publicação iguais', async () => {
      const sameYearBooks = [
        { _id: '1', titulo: 'Livro B', autores: [{ nome: 'Autor A' }], ano_publicacao: 2000 },
        { _id: '2', titulo: 'Livro A', autores: [{ nome: 'Autor B' }], ano_publicacao: 2000 },
        { _id: '3', titulo: 'Livro C', autores: [{ nome: 'Autor C' }], ano_publicacao: 2000 },
      ];
      
      (livrosService.getBooks as jest.Mock).mockResolvedValue(sameYearBooks);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const filterSelect = screen.getByTestId('filter-select');
      fireEvent.change(filterSelect, { target: { value: 'Mais Recentes' } });
      
      await waitFor(() => {
        const bookElements = screen.getAllByTestId(/book-/);
        const titles = bookElements.map(el => el.querySelector('h3')?.textContent || '');
        expect(titles).toEqual(expect.arrayContaining(['Livro B', 'Livro A', 'Livro C']));
        expect(titles).toHaveLength(3);
      });
    });
  });

  describe('Component structure and styling', () => {
    beforeEach(async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      render(<LivrosPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('deve renderizar estrutura correta do layout', () => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('w-full h-full flex flex-col px-4 pb-2 gap-2');
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('searchbar')).toBeInTheDocument();
      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
    });

    it('deve renderizar grid de livros com classes CSS corretas', () => {
      const booksGrid = screen.getByText('Dom Quixote').closest('div[class*="grid"]');
      expect(booksGrid).toHaveClass('grid grid-cols-3 gap-1');
    });

    it('deve passar colorScheme correto para DropdownFilter', () => {
      const dropdownFilter = screen.getByTestId('dropdown-filter');
      expect(dropdownFilter).toHaveTextContent('dark-brown');
    });
  });

  describe('Performance and optimization', () => {
    it('deve fazer chamada API apenas uma vez', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      expect(livrosService.getBooks).toHaveBeenCalledTimes(1);
    });

    it('deve aplicar ordenação apenas quando filtro muda ou livros carregam', async () => {
      (livrosService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      
      render(<LivrosPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      const initialBooks = screen.getAllByTestId(/book-/);
      expect(initialBooks[0]).toHaveTextContent('1984');
      
      const filterSelect = screen.getByTestId('filter-select');
      fireEvent.change(filterSelect, { target: { value: 'Z-A Título' } });
      
      await waitFor(() => {
        const reorderedBooks = screen.getAllByTestId(/book-/);
        expect(reorderedBooks[0]).toHaveTextContent('Dom Quixote');
      });
    });
  });
});