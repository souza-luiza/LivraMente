import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadlistPage from '@/app/readlist/page';

// Mock dos componentes Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock do Sidebar
jest.mock('@/components/sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

// Mock dos ícones
jest.mock('@/components/icons/SearchIcon', () => {
  return function MockSearchIcon(props: any) {
    return <svg data-testid="search-icon" {...props} />;
  };
});

jest.mock('@/components/icons/LikeIcon', () => {
  return function MockLikeIcon(props: any) {
    return <svg data-testid="like-icon" {...props} />;
  };
});

jest.mock('@/components/icons/ShareIcon', () => {
  return function MockShareIcon(props: any) {
    return <svg data-testid="share-icon" {...props} />;
  };
});

jest.mock('@/components/icons/ListIcon', () => {
  return function MockListIcon(props: any) {
    return <svg data-testid="list-icon" {...props} />;
  };
});

jest.mock('@/components/icons/GridIcon', () => {
  return function MockGridIcon(props: any) {
    return <svg data-testid="grid-icon" {...props} />;
  };
});

jest.mock('@/components/icons/StarIcon', () => {
  return function MockStarIcon(props: any) {
    return <svg data-testid="star-icon" {...props} />;
  };
});

describe('ReadlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Inicial', () => {
    it('deve renderizar a página corretamente', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Pesquisar em livros lidos')).toBeInTheDocument();
      expect(screen.getByText('Livros 2025')).toBeInTheDocument();
      expect(screen.getByText('gatanoturna')).toBeInTheDocument();
    });

    it('deve renderizar a barra de pesquisa', () => {
      render(<ReadlistPage />);
      
      const searchInput = screen.getByPlaceholderText('Pesquisar em livros lidos');
      expect(searchInput).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('deve renderizar as estatísticas de progresso', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByText('Você já leu')).toBeInTheDocument();
      expect(screen.getByText('20 de 28')).toBeInTheDocument();
      expect(screen.getByText('71%')).toBeInTheDocument();
    });

    it('deve renderizar a descrição da readlist', () => {
      render(<ReadlistPage />);
      
      const description = screen.getByText(/Lorem Ipsum is simply dummy text/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Interações com Ícones', () => {
    it('deve alternar o estado do ícone de like quando clicado', () => {
      render(<ReadlistPage />);
      
      const likeButton = screen.getByLabelText('Curtir');
      const likeIcon = screen.getByTestId('like-icon');
      
      // Estado inicial - não preenchido
      expect(likeIcon).toHaveStyle({ fill: 'none' });
      
      // Clicar para curtir
      fireEvent.click(likeButton);
      
      // Após clicar - preenchido
      expect(likeIcon).toHaveStyle({ fill: 'var(--primary-600)' });
      
      // Clicar novamente para descurtir
      fireEvent.click(likeButton);
      
      // Volta ao estado inicial
      expect(likeIcon).toHaveStyle({ fill: 'none' });
    });

    it('deve alternar o estado do ícone de compartilhar quando clicado', () => {
      render(<ReadlistPage />);
      
      const shareButton = screen.getByLabelText('Compartilhar');
      const shareIcon = screen.getByTestId('share-icon');
      
      // Estado inicial
      expect(shareIcon).toHaveStyle({ opacity: '0.7' });
      
      // Clicar para compartilhar
      fireEvent.click(shareButton);
      
      // Após clicar
      expect(shareIcon).toHaveStyle({ opacity: '1' });
      
      // Clicar novamente
      fireEvent.click(shareButton);
      
      // Volta ao estado inicial
      expect(shareIcon).toHaveStyle({ opacity: '0.7' });
    });
  });

  describe('Modos de Visualização', () => {
    it('deve iniciar no modo grid por padrão', () => {
      const { container } = render(<ReadlistPage />);
      
      // Verifica se o grid está presente (classe grid)
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('deve alternar para o modo lista quando clicado', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      // Verifica se há elementos específicos da visualização em lista
      const bookTitles = screen.getAllByText(/Jantar Secreto|A Empregada|Recursão|Livro \d+/);
      expect(bookTitles.length).toBeGreaterThan(0);
    });

    it('deve alternar entre grid e lista corretamente', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      const gridButton = screen.getByLabelText('Visualização em grade');
      
      // Alternar para lista
      fireEvent.click(listButton);
      expect(listButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
      
      // Voltar para grid
      fireEvent.click(gridButton);
      expect(gridButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
    });

    it('deve exibir as estrelas de avaliação no modo lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      const stars = screen.getAllByTestId('star-icon');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe('Grid de Livros', () => {
    it('deve renderizar múltiplos livros no grid', () => {
      render(<ReadlistPage />);
      
      // Verifica se há pelo menos alguns livros renderizados
      const bookElements = screen.getAllByRole('button');
      const bookButtons = bookElements.filter(btn => 
        btn.getAttribute('aria-label')?.includes('Livro')
      );
      
      expect(bookButtons.length).toBeGreaterThan(0);
    });

    it('deve aplicar hover nos livros do grid', () => {
      render(<ReadlistPage />);
      
      const firstBook = screen.getByRole('button', { name: 'Livro 1' });
      
      // Mouse enter
      fireEvent.mouseEnter(firstBook);
      expect(firstBook).toHaveStyle({ opacity: '0.8', transform: 'scale(1.05)' });
      
      // Mouse leave
      fireEvent.mouseLeave(firstBook);
      expect(firstBook).toHaveStyle({ opacity: '1', transform: 'scale(1)' });
    });
  });

  describe('Lista de Livros', () => {
    it('deve renderizar informações detalhadas dos livros no modo lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      // Verifica se os títulos dos livros estão presentes
      expect(screen.getByText('Jantar Secreto')).toBeInTheDocument();
      expect(screen.getByText('A Empregada')).toBeInTheDocument();
      expect(screen.getByText('Recursão')).toBeInTheDocument();
    });

    it('deve exibir ano e páginas dos livros no modo lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      expect(screen.getByText('2016 • 416 pags')).toBeInTheDocument();
      expect(screen.getByText('2018 • 208 pags')).toBeInTheDocument();
      expect(screen.getByText('2020 • 300 pags')).toBeInTheDocument();
    });
  });

  describe('Barra de Progresso', () => {
    it('deve renderizar a barra de progresso com a porcentagem correta', () => {
      const { container } = render(<ReadlistPage />);
      
      const progressBar = container.querySelector('[style*="width: 71%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('deve exibir o número correto de livros lidos', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByText('20 de 28')).toBeInTheDocument();
      expect(screen.getByText('71%')).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve ter classes responsivas no container principal', () => {
      const { container } = render(<ReadlistPage />);
      
      const mainContent = container.querySelector('.flex-1');
      expect(mainContent).toHaveClass('px-4', 'md:px-8', 'lg:px-[200px]');
    });

    it('deve ter grid responsivo com diferentes números de colunas', () => {
      const { container } = render(<ReadlistPage />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid-cols-2',
        'sm:grid-cols-3',
        'md:grid-cols-4',
        'lg:grid-cols-5',
        'xl:grid-cols-6'
      );
    });

    it('deve ter layout flexível para descrição e estatísticas', () => {
      const { container } = render(<ReadlistPage />);
      
      const descriptionContainer = container.querySelector('.flex-col.lg\\:flex-row');
      expect(descriptionContainer).toBeInTheDocument();
    });
  });

  describe('Imagens', () => {
    it('deve renderizar a imagem de capa da readlist', () => {
      const { container } = render(<ReadlistPage />);
      
      // Verifica se há imagens renderizadas
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('deve renderizar o avatar do autor', () => {
      const { container } = render(<ReadlistPage />);
      
      // Verifica se há pelo menos uma imagem para o avatar
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      
      // Verifica se o username está presente (indicando que o avatar está na tela)
      expect(screen.getByText('gatanoturna')).toBeInTheDocument();
    });

    it('deve renderizar as capas dos livros', () => {
      const { container } = render(<ReadlistPage />);
      
      // Verifica se há múltiplas imagens (incluindo capas dos livros)
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(2); // Pelo menos capa da readlist + avatar + algumas capas de livros
    });
  });

  describe('Interação com Input de Pesquisa', () => {
    it('deve permitir digitar no campo de pesquisa', () => {
      render(<ReadlistPage />);
      
      const searchInput = screen.getByPlaceholderText('Pesquisar em livros lidos') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'Jantar' } });
      
      expect(searchInput.value).toBe('Jantar');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-labels nos botões de ação', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByLabelText('Curtir')).toBeInTheDocument();
      expect(screen.getByLabelText('Compartilhar')).toBeInTheDocument();
      expect(screen.getByLabelText('Visualização em lista')).toBeInTheDocument();
      expect(screen.getByLabelText('Visualização em grade')).toBeInTheDocument();
    });

    it('deve ter aria-labels nos livros do grid', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByRole('button', { name: 'Livro 1' })).toBeInTheDocument();
    });

    it('deve ter tabIndex nos elementos interativos', () => {
      render(<ReadlistPage />);
      
      const firstBook = screen.getByRole('button', { name: 'Livro 1' });
      expect(firstBook).toHaveAttribute('tabIndex', '0');
    });
  });
});
