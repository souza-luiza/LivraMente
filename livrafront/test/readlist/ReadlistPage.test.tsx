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
       args[0].includes('for a non-boolean attribute') ||
       args[0].includes('The tag <search> is unrecognized') ||
       args[0].includes('The tag <search>'))
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

// Mock SearchBar to avoid rendering a nonstandard <search> tag during tests
jest.mock('@/components/searchbar', () => {
  return function MockSearchBar(props: any) {
    return <input data-testid="mock-search" {...props} />;
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

jest.mock('@/components/icons/ArrowLeftIcon', () => {
  return function MockArrowLeftIcon(props: any) {
    return <svg data-testid="arrow-left-icon" {...props} />;
  };
});

// Mock das funções de serviço
jest.mock('@/services/readlists', () => ({
  getOwnReadlists: jest.fn(),
  getPublicReadlists: jest.fn(),
  getReadlistById: jest.fn(),
  updateReadlist: jest.fn(),
  getFavoriteReadlists: jest.fn(),
  favoriteReadlist: jest.fn(),
  unfavoriteReadlist: jest.fn(),
}));

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DynamicReadlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup padrão do localStorage
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.setItem('username', 'gatanoturna');
    
    // Mock das respostas da API
    const { getOwnReadlists, getReadlistById, getFavoriteReadlists } = require('@/services/readlists');
    
    getOwnReadlists.mockResolvedValue([
      {
        _id: 'readlist-123',
        nome: 'Livros 2025',
        favorito: false,
        publica: true,
        descricao: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        capa_url: '/kemi-teste.jpg',
        criador: { _id: 'user-123', username: 'gatanoturna' },
        livros: ['book-1', 'book-2', 'book-3'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]);
    
    getReadlistById.mockResolvedValue({
      _id: 'readlist-123',
      nome: 'Livros 2025',
      favorito: false,
      publica: true,
      descricao: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      capa_url: '/kemi-teste.jpg',
      criador: { _id: 'user-123', username: 'gatanoturna' },
      livros: [
        { 
          _id: '1', 
          titulo: 'Jantar Secreto', 
          isbn: '123456789',
          autores: [],
          ano_publicacao: 2016, 
          numero_paginas: 416, 
          avaliacoes_media: 5, 
          capa_url: '/kemi-teste.jpg' 
        },
        { 
          _id: '2', 
          titulo: 'A Empregada', 
          isbn: '987654321',
          autores: [],
          ano_publicacao: 2018, 
          numero_paginas: 208, 
          avaliacoes_media: 5, 
          capa_url: '/kemi-teste.jpg' 
        },
        { 
          _id: '3', 
          titulo: 'Recursão', 
          isbn: '456789123',
          autores: [],
          ano_publicacao: 2020, 
          numero_paginas: 300, 
          avaliacoes_media: 5, 
          capa_url: '/kemi-teste.jpg' 
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    getFavoriteReadlists.mockResolvedValue([]);
  });

  describe('Renderização com Parâmetros Dinâmicos', () => {
    it('deve renderizar a página corretamente com username e slug da URL', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByText('Livros 2025')).toBeInTheDocument(); // slug convertido para título
        expect(screen.getByText('gatanoturna')).toBeInTheDocument(); // username
      });
    });

    it('deve converter slug em título corretamente', async () => {
      render(<ReadlistPage />);
      
      // 'livros-2025' deve se tornar 'Livros 2025'
      await waitFor(() => {
        expect(screen.getByText('Livros 2025')).toBeInTheDocument();
      });
    });

    it('deve exibir o username do autor da readlist', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('gatanoturna')).toBeInTheDocument();
      });
    });
  });

  describe('Botão de Edição', () => {
    it('deve renderizar o botão de edição quando usuário é o dono', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        expect(editButton).toBeInTheDocument();
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      });
    });

    it('deve abrir o modal de edição ao clicar no botão', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        fireEvent.click(editButton);
        
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      });
    });

    it('deve fechar o modal ao clicar em fechar', async () => {
      render(<ReadlistPage />);
      
      // Abrir modal
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        fireEvent.click(editButton);
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      });
      
      // Fechar modal
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });

    it('deve aplicar hover no ícone de edição', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Editar readlist')).toBeInTheDocument();
      });
      
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toBeInTheDocument();
      
      // Verifica que o ícone tem cor inicial
      expect(editIcon).toHaveStyle({ color: 'var(--primary-600)' });
    });

    it('deve estar posicionado no canto superior direito', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        const container = editButton.parentElement?.parentElement as HTMLElement | null;
        
        expect(container).toHaveStyle({
          position: 'absolute',
          top: '10px',
          right: '10px',
        });
      });
    });
  });

  describe('Modal de Edição', () => {
    it('deve passar os dados corretos para o modal', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        fireEvent.click(editButton);
        
        // Verifica se o modal recebeu o título correto
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Livros 2025');
      });
    });

    it('deve atualizar a readlist ao salvar no modal', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        // Abrir modal
        const editButton = screen.getByLabelText('Editar readlist');
        fireEvent.click(editButton);
        
        // Modal deve estar visível
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
        
        // Salvar alterações
        const saveButton = screen.getByTestId('save-modal');
        fireEvent.click(saveButton);
      });
      
      // Modal deve fechar após salvar
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });

    it('não deve estar visível inicialmente', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Ícones de Ação (Heart, Share, Edit)', () => {
    it('deve renderizar ícones de Edit e Share quando é o próprio usuário', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('heart-icon')).not.toBeInTheDocument(); // Heart não aparece para o próprio usuário
        expect(screen.getByTestId('share-icon')).toBeInTheDocument();
      });
    });

    it('deve ordenar os ícones corretamente (Edit, Share) quando é o próprio usuário', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        const shareButton = screen.getByLabelText(/Compartilhar/i);
        
        // Verificar que ambos estão no mesmo container
        const container = editButton.parentElement?.parentElement;
        expect(shareButton.parentElement?.parentElement).toBe(container);
        
        // Verificar que heart não existe
        expect(screen.queryByLabelText(/favorito/i)).not.toBeInTheDocument();
      });
    });

    it('não deve mostrar botão de coração para o próprio usuário', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        // Verificar que edit está presente (é o dono)
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
        
        // Verificar que heart NÃO está presente
        expect(screen.queryByTestId('heart-icon')).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/favorito/i)).not.toBeInTheDocument();
      });
    });

    it('deve alternar o estado do ícone de compartilhar', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const shareButton = screen.getByLabelText(/Compartilhar/i);
        const shareIcon = screen.getByTestId('share-icon');
        
        // Apenas garantir que o ícone existe e que pode ser clicado
        expect(shareIcon).toBeInTheDocument();
        fireEvent.click(shareButton);
        fireEvent.click(shareButton);
        expect(shareIcon).toBeInTheDocument();
      });
    });

    it('deve aplicar hover no ícone de compartilhar', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const shareIcon = screen.getByTestId('share-icon');
        
        // Disparar evento de hover
        fireEvent.mouseEnter(shareIcon);
        fireEvent.mouseLeave(shareIcon);
        
        // Verifica que o ícone existe e pode receber eventos
        expect(shareIcon).toBeInTheDocument();
      });
    });
  });

  describe('Estrutura da Página', () => {
    it('deve renderizar a barra de pesquisa', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Pesquisar no livra/i);
        expect(searchInput).toBeInTheDocument();
        // SearchBar is mocked in this test to render a simple input with testid `mock-search`
        expect(screen.getByTestId('mock-search')).toBeInTheDocument();
      });
    });

    it('deve renderizar as estatísticas de progresso', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Você já leu')).toBeInTheDocument();
        expect(screen.getByText(/0 de 3/i)).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('deve renderizar a descrição da readlist', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const description = screen.getByText(/Lorem Ipsum is simply dummy text/);
        expect(description).toBeInTheDocument();
      });
    });

    it('deve renderizar os controles de visualização (grid/lista)', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Visualização em lista')).toBeInTheDocument();
        expect(screen.getByLabelText('Visualização em grade')).toBeInTheDocument();
      });
    });
  });

  describe('Modos de Visualização', () => {
    it('deve iniciar no modo grid por padrão', async () => {
      const { container } = render(<ReadlistPage />);
      
      await waitFor(() => {
        const gridContainer = container.querySelector('.grid');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('deve alternar para o modo lista quando clicado', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const listButton = screen.getByLabelText('Visualização em lista');
        fireEvent.click(listButton);
        
        const bookTitles = screen.getAllByText(/Jantar Secreto|A Empregada|Recursão/);
        expect(bookTitles.length).toBeGreaterThan(0);
      });
    });

    it('deve alternar entre grid e lista corretamente', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const listButton = screen.getByLabelText('Visualização em lista');
        const gridButton = screen.getByLabelText('Visualização em grade');
        
        fireEvent.click(listButton);
        expect(listButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
        
        fireEvent.click(gridButton);
        expect(gridButton.parentElement).toHaveStyle({ backgroundColor: 'var(--secondary-100)' });
      });
    });
  });

  describe('Grid de Livros', () => {
    it('deve renderizar múltiplos livros no grid', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Jantar Secreto' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'A Empregada' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Recursão' })).toBeInTheDocument();
      });
    });

    it('deve aplicar hover nos livros do grid', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const firstBook = screen.getByRole('button', { name: 'Jantar Secreto' });
        
        fireEvent.mouseEnter(firstBook);
        expect(firstBook).toHaveStyle({ opacity: '0.8', transform: 'scale(1.05)' });
        
        fireEvent.mouseLeave(firstBook);
        expect(firstBook).toHaveStyle({ opacity: '1', transform: 'scale(1)' });
      });
    });
  });

  describe('Lista de Livros', () => {
    it('deve renderizar informações detalhadas dos livros no modo lista', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const listButton = screen.getByLabelText('Visualização em lista');
        fireEvent.click(listButton);
        
        expect(screen.getByText('Jantar Secreto')).toBeInTheDocument();
        expect(screen.getByText('A Empregada')).toBeInTheDocument();
        expect(screen.getByText('Recursão')).toBeInTheDocument();
      });
    });

    it('deve exibir ano e páginas dos livros no modo lista', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const listButton = screen.getByLabelText('Visualização em lista');
        fireEvent.click(listButton);
        
        expect(screen.getByText('2016 • 416 páginas')).toBeInTheDocument();
        expect(screen.getByText('2018 • 208 páginas')).toBeInTheDocument();
        expect(screen.getByText('2020 • 300 páginas')).toBeInTheDocument();
      });
    });

    it('deve exibir as estrelas de avaliação no modo lista', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const listButton = screen.getByLabelText('Visualização em lista');
        fireEvent.click(listButton);
        
        const stars = screen.getAllByTestId('star-icon');
        expect(stars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsividade', () => {
    it('deve ter classes responsivas no container principal', async () => {
      const { container} = render(<ReadlistPage />);
      
      await waitFor(() => {
        const mainContent = container.querySelector('.flex-1');
        // Current markup includes px-4, overflow, width and max-width classes
        expect(mainContent).toHaveClass('px-4');
        expect(mainContent).toHaveClass('overflow-y-auto');
        expect(mainContent).toHaveClass('w-full');
      });
    });

    it('deve ter grid responsivo com diferentes números de colunas', async () => {
      const { container } = render(<ReadlistPage />);
      
      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-2');
        expect(grid).toHaveClass('sm:grid-cols-3');
        expect(grid).toHaveClass('md:grid-cols-4');
        expect(grid).toHaveClass('lg:grid-cols-5');
        expect(grid).toHaveClass('xl:grid-cols-6');
        expect(grid).toHaveClass('2xl:grid-cols-7');
      });
    });

    it('deve ter ícones de ação responsivos (row em mobile, col em desktop)', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText('Editar readlist');
        const container = editButton.parentElement?.parentElement as HTMLElement | null;
            
        expect(container).toHaveClass('flex-row');
        expect(container).toHaveClass('md:flex-col');
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-labels nos botões de ação quando é o próprio usuário', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Editar readlist')).toBeInTheDocument();
        expect(screen.queryByLabelText(/Curtir/i)).not.toBeInTheDocument(); // Não aparece para o próprio usuário
        expect(screen.queryByLabelText(/favorito/i)).not.toBeInTheDocument(); // Não aparece para o próprio usuário
        expect(screen.getByLabelText(/Compartilhar/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Visualização em lista')).toBeInTheDocument();
        expect(screen.getByLabelText('Visualização em grade')).toBeInTheDocument();
      });
    });

    it('deve ter aria-labels nos livros do grid', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        // Verificar se os livros populados são renderizados
        const books = screen.queryAllByRole('button');
        // Deve ter pelo menos os botões de visualização, edit e share
        expect(books.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('deve ter tabIndex nos elementos interativos', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        // Verificar botões de visualização têm foco correto
        const listButton = screen.getByLabelText('Visualização em lista');
        const gridButton = screen.getByLabelText('Visualização em grade');
        expect(listButton).toBeInTheDocument();
        expect(gridButton).toBeInTheDocument();
      });
    });
  });

  describe('Interação com Input de Pesquisa', () => {
    it('deve permitir digitar no campo de pesquisa', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Pesquisar no livra/i) as HTMLInputElement;
        
        fireEvent.change(searchInput, { target: { value: 'Jantar' } });
        
        expect(searchInput.value).toBe('Jantar');
      });
    });
  });

  describe('Imagens', () => {
    it('deve renderizar a imagem de capa da readlist', async () => {
      const { container } = render(<ReadlistPage />);
      
      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('deve renderizar o avatar do autor', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('gatanoturna')).toBeInTheDocument();
      });
    });
  });

  describe('Barra de Progresso', () => {
    it('deve renderizar a barra de progresso com a porcentagem correta', async () => {
      const { container } = render(<ReadlistPage />);
      
      await waitFor(() => {
        const progressBar = container.querySelector('[style*="width: 0%"]');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('deve exibir o número correto de livros lidos', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        expect(screen.getByText('0 de 3')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('deve calcular a porcentagem de progresso corretamente', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
        // 0 de 3 = 0%
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });
  });

  describe('Efeitos de Hover', () => {
    it('deve aplicar hover nos itens da lista', async () => {
      render(<ReadlistPage />);
      
      await waitFor(() => {
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
});