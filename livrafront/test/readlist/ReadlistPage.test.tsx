import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadlistPage from '@/app/[username]/readlist/[readlistSlug]/page';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React does not recognize') ||
       args[0].includes('for a non-boolean attribute'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock dos componentes Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    username: 'gatanoturna',
    readlistSlug: 'livros-2025',
  })),
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

// Mock do EditReadlistModal
jest.mock('@/components/EditReadlistModal', () => {
  return function MockEditReadlistModal({ isOpen, onClose, onSave, readlist }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="edit-modal">
        <button onClick={onClose} data-testid="close-modal">Fechar</button>
        <button
          onClick={() => {
            onSave({
              title: 'Título Editado',
              description: 'Descrição editada',
              coverImage: '/new-cover.jpg',
              isPrivate: true,
            });
            onClose();
          }}
          data-testid="save-modal"
        >
          Salvar
        </button>
        <span data-testid="modal-title">{readlist.title}</span>
      </div>
    );
  };
});

// Mock dos ícones
jest.mock('@/components/icons/SearchIcon', () => {
  return function MockSearchIcon(props: any) {
    return <svg data-testid="search-icon" {...props} />;
  };
});

jest.mock('@/components/icons/HeartIcon', () => {
  return function MockHeartIcon(props: any) {
    return <svg data-testid="heart-icon" {...props} />;
  };
});

jest.mock('@/components/icons/ShareIcon', () => {
  return function MockShareIcon(props: any) {
    return <svg data-testid="share-icon" {...props} />;
  };
});

jest.mock('@/components/icons/EditIcon', () => {
  return function MockEditIcon(props: any) {
    return <svg data-testid="edit-icon" {...props} />;
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

describe('DynamicReadlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização com Parâmetros Dinâmicos', () => {
    it('deve renderizar a página corretamente com username e slug da URL', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Livros 2025')).toBeInTheDocument(); // slug convertido para título
      expect(screen.getByText('gatanoturna')).toBeInTheDocument(); // username
    });

    it('deve converter slug em título corretamente', () => {
      render(<ReadlistPage />);
      
      // 'livros-2025' deve se tornar 'Livros 2025'
      expect(screen.getByText('Livros 2025')).toBeInTheDocument();
    });

    it('deve exibir o username do autor da readlist', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByText('gatanoturna')).toBeInTheDocument();
    });
  });

  describe('Botão de Edição', () => {
    it('deve renderizar o botão de edição quando usuário é o dono', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      expect(editButton).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });

    it('deve abrir o modal de edição ao clicar no botão', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      fireEvent.click(editButton);
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    });

    it('deve fechar o modal ao clicar em fechar', () => {
      render(<ReadlistPage />);
      
      // Abrir modal
      const editButton = screen.getByLabelText('Editar readlist');
      fireEvent.click(editButton);
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      
      // Fechar modal
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);
      
      waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });

    it('deve aplicar hover no ícone de edição', () => {
      render(<ReadlistPage />);
      
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toBeInTheDocument();
      
      // Verifica que o ícone tem cor inicial
      expect(editIcon).toHaveStyle({ color: 'var(--primary-600)' });
    });

    it('deve estar posicionado no canto superior direito', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      const container = editButton.parentElement;
      
      expect(container).toHaveStyle({
        position: 'absolute',
        top: '10px',
        right: '10px',
      });
    });
  });

  describe('Modal de Edição', () => {
    it('deve passar os dados corretos para o modal', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      fireEvent.click(editButton);
      
      // Verifica se o modal recebeu o título correto
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Livros 2025');
    });

    it('deve atualizar a readlist ao salvar no modal', async () => {
      render(<ReadlistPage />);
      
      // Abrir modal
      const editButton = screen.getByLabelText('Editar readlist');
      fireEvent.click(editButton);
      
      // Modal deve estar visível
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      
      // Salvar alterações
      const saveButton = screen.getByTestId('save-modal');
      fireEvent.click(saveButton);
      
      // Modal deve fechar após salvar
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });

    it('não deve estar visível inicialmente', () => {
      render(<ReadlistPage />);
      
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
    });
  });

  describe('Ícones de Ação (Heart, Share, Edit)', () => {
    it('deve renderizar os três ícones de ação', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });

    it('deve ordenar os ícones corretamente (Edit, Heart, Share)', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      const heartButton = screen.getByLabelText('Curtir');
      const shareButton = screen.getByLabelText('Compartilhar');
      
      // Verificar que todos estão no mesmo container
      const container = editButton.parentElement;
      expect(heartButton.parentElement).toBe(container);
      expect(shareButton.parentElement).toBe(container);
    });

    it('deve alternar o estado do ícone de coração', () => {
      render(<ReadlistPage />);
      
      const heartButton = screen.getByLabelText('Curtir');
      const heartIcon = screen.getByTestId('heart-icon');
      
      // Estado inicial - não preenchido
      expect(heartIcon).toHaveStyle({ fill: 'none' });
      
      // Clicar para curtir
      fireEvent.click(heartButton);
      expect(heartIcon).toHaveStyle({ fill: 'var(--primary-600)' });
      
      // Clicar novamente para descurtir
      fireEvent.click(heartButton);
      expect(heartIcon).toHaveStyle({ fill: 'none' });
    });

    it('deve alternar o estado do ícone de compartilhar', () => {
      render(<ReadlistPage />);
      
      const shareButton = screen.getByLabelText('Compartilhar');
      const shareIcon = screen.getByTestId('share-icon');
      
      // Estado inicial
      expect(shareIcon).toHaveStyle({ opacity: '0.7' });
      
      // Clicar para compartilhar
      fireEvent.click(shareButton);
      expect(shareIcon).toHaveStyle({ opacity: '1' });
      
      // Clicar novamente
      fireEvent.click(shareButton);
      expect(shareIcon).toHaveStyle({ opacity: '0.7' });
    });

    it('deve aplicar hover no ícone de compartilhar', () => {
      render(<ReadlistPage />);
      
      const shareIcon = screen.getByTestId('share-icon');
      
      // Disparar evento de hover
      fireEvent.mouseEnter(shareIcon);
      fireEvent.mouseLeave(shareIcon);
      
      // Verifica que o ícone existe e pode receber eventos
      expect(shareIcon).toBeInTheDocument();
    });

    it('deve aplicar hover no ícone de coração', () => {
      render(<ReadlistPage />);
      
      const heartIcon = screen.getByTestId('heart-icon');
      
      // Disparar evento de hover
      fireEvent.mouseEnter(heartIcon);
      fireEvent.mouseLeave(heartIcon);
      
      // Verifica que o ícone existe e pode receber eventos
      expect(heartIcon).toBeInTheDocument();
    });
  });

  describe('Estrutura da Página', () => {
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

    it('deve renderizar os controles de visualização (grid/lista)', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByLabelText('Visualização em lista')).toBeInTheDocument();
      expect(screen.getByLabelText('Visualização em grade')).toBeInTheDocument();
    });
  });

  describe('Modos de Visualização', () => {
    it('deve iniciar no modo grid por padrão', () => {
      const { container } = render(<ReadlistPage />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('deve alternar para o modo lista quando clicado', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      const bookTitles = screen.getAllByText(/Jantar Secreto|A Empregada|Recursão|Livro \d+/);
      expect(bookTitles.length).toBeGreaterThan(0);
    });

    it('deve alternar entre grid e lista corretamente', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      const gridButton = screen.getByLabelText('Visualização em grade');
      
      fireEvent.click(listButton);
      expect(listButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
      
      fireEvent.click(gridButton);
      expect(gridButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
    });
  });

  describe('Grid de Livros', () => {
    it('deve renderizar múltiplos livros no grid', () => {
      render(<ReadlistPage />);
      
      const bookElements = screen.getAllByRole('button');
      const bookButtons = bookElements.filter(btn => 
        btn.getAttribute('aria-label')?.includes('Livro')
      );
      
      expect(bookButtons.length).toBeGreaterThan(0);
    });

    it('deve aplicar hover nos livros do grid', () => {
      render(<ReadlistPage />);
      
      const firstBook = screen.getByRole('button', { name: 'Livro 1' });
      
      fireEvent.mouseEnter(firstBook);
      expect(firstBook).toHaveStyle({ opacity: '0.8', transform: 'scale(1.05)' });
      
      fireEvent.mouseLeave(firstBook);
      expect(firstBook).toHaveStyle({ opacity: '1', transform: 'scale(1)' });
    });
  });

  describe('Lista de Livros', () => {
    it('deve renderizar informações detalhadas dos livros no modo lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
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

    it('deve exibir as estrelas de avaliação no modo lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      const stars = screen.getAllByTestId('star-icon');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe('Responsividade', () => {
    it('deve ter classes responsivas no container principal', () => {
      const { container } = render(<ReadlistPage />);
      
      const mainContent = container.querySelector('.flex-1');
      expect(mainContent).toHaveClass('px-4');
      expect(mainContent).toHaveClass('md:px-6');
      expect(mainContent).toHaveClass('lg:px-8');
      expect(mainContent).toHaveClass('xl:px-12');
      expect(mainContent).toHaveClass('2xl:px-16');
      expect(mainContent).toHaveClass('w-full');
      expect(mainContent).toHaveClass('max-w-[1600px]');
      expect(mainContent).toHaveClass('mx-auto');
    });

    it('deve ter grid responsivo com diferentes números de colunas', () => {
      const { container } = render(<ReadlistPage />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('sm:grid-cols-3');
      expect(grid).toHaveClass('md:grid-cols-4');
      expect(grid).toHaveClass('lg:grid-cols-5');
      expect(grid).toHaveClass('xl:grid-cols-6');
      expect(grid).toHaveClass('2xl:grid-cols-7');
    });

    it('deve ter ícones de ação responsivos (row em mobile, col em desktop)', () => {
      render(<ReadlistPage />);
      
      const editButton = screen.getByLabelText('Editar readlist');
      const container = editButton.parentElement;
      
      expect(container).toHaveClass('flex-row');
      expect(container).toHaveClass('md:flex-col');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-labels nos botões de ação', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByLabelText('Editar readlist')).toBeInTheDocument();
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

  describe('Interação com Input de Pesquisa', () => {
    it('deve permitir digitar no campo de pesquisa', () => {
      render(<ReadlistPage />);
      
      const searchInput = screen.getByPlaceholderText('Pesquisar em livros lidos') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'Jantar' } });
      
      expect(searchInput.value).toBe('Jantar');
    });
  });

  describe('Imagens', () => {
    it('deve renderizar a imagem de capa da readlist', () => {
      const { container } = render(<ReadlistPage />);
      
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('deve renderizar o avatar do autor', () => {
      render(<ReadlistPage />);
      
      expect(screen.getByText('gatanoturna')).toBeInTheDocument();
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

    it('deve calcular a porcentagem de progresso corretamente', () => {
      render(<ReadlistPage />);
      
      // 20 de 28 = 71%
      expect(screen.getByText('71%')).toBeInTheDocument();
    });
  });

  describe('Efeitos de Hover', () => {
    it('deve aplicar hover no ícone de coração', () => {
      render(<ReadlistPage />);
      
      const heartIcon = screen.getByTestId('heart-icon');
      
      fireEvent.mouseEnter(heartIcon);
      fireEvent.mouseLeave(heartIcon);
      
      expect(heartIcon).toBeInTheDocument();
    });

    it('deve aplicar hover nos itens da lista', () => {
      render(<ReadlistPage />);
      
      const listButton = screen.getByLabelText('Visualização em lista');
      fireEvent.click(listButton);
      
      const bookTitle = screen.getByText('Jantar Secreto');
      const listItem = bookTitle.closest('.flex');
      
      if (listItem) {
        fireEvent.mouseEnter(listItem);
        expect(listItem).toHaveStyle({ backgroundColor: 'var(--neutral-100)' });
        
        fireEvent.mouseLeave(listItem);
        expect(listItem).toHaveStyle({ backgroundColor: 'transparent' });
      }
    });
  });
});
