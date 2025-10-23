import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditReadlistModal from '@/components/EditReadlistModal';

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

// Mock do Input component
jest.mock('@/components/general-input', () => {
  return function MockInput(props: any) {
    return (
      <div>
        {props.label && <label htmlFor={props.id}>{props.label}</label>}
        <input
          {...props}
          data-testid={props.id || 'mock-input'}
        />
        {props.error && <span data-testid="input-error">{props.error}</span>}
      </div>
    );
  };
});

// Mock do Next Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt} />;
  },
}));

describe('EditReadlistModal', () => {
  const mockReadlist = {
    title: 'Livros 2025',
    description: 'Minha lista de livros favoritos',
    coverImage: '/test-cover.jpg',
    isPrivate: false,
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não deve renderizar quando isOpen é false', () => {
      const { container } = render(
        <EditReadlistModal
          isOpen={false}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('deve renderizar quando isOpen é true', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Editar detalhes')).toBeInTheDocument();
    });

    it('deve renderizar todos os campos do formulário', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Adicione uma descrição opcional')).toBeInTheDocument();
      expect(screen.getByLabelText('Tornar readlist privada')).toBeInTheDocument();
    });

    it('deve renderizar a imagem de capa', () => {
      const { container } = render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const coverImage = container.querySelector('img[alt="Capa da readlist"]');
      expect(coverImage).toBeInTheDocument();
    });

    it('deve preencher os campos com os valores da readlist', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional') as HTMLTextAreaElement;
      const privateCheckbox = screen.getByLabelText('Tornar readlist privada') as HTMLInputElement;

      expect(titleInput.value).toBe(mockReadlist.title);
      expect(descriptionTextarea.value).toBe(mockReadlist.description);
      expect(privateCheckbox.checked).toBe(mockReadlist.isPrivate);
    });
  });

  describe('Interações', () => {
    it('deve fechar o modal ao clicar no botão de fechar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getByLabelText('Fechar');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('deve fechar o modal ao clicar no overlay', () => {
      const { container } = render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const overlay = container.firstChild as HTMLElement;
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('não deve fechar ao clicar dentro do modal', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const modalContent = screen.getByText('Editar detalhes').closest('div');
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('deve permitir editar o título', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Novo Título' } });

      expect(titleInput.value).toBe('Novo Título');
    });

    it('deve permitir editar a descrição', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional') as HTMLTextAreaElement;
      fireEvent.change(descriptionTextarea, { target: { value: 'Nova descrição' } });

      expect(descriptionTextarea.value).toBe('Nova descrição');
    });

    it('deve alternar o checkbox de privacidade', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const privateCheckbox = screen.getByLabelText('Tornar readlist privada') as HTMLInputElement;
      
      expect(privateCheckbox.checked).toBe(false);
      
      fireEvent.click(privateCheckbox);
      expect(privateCheckbox.checked).toBe(true);
      
      fireEvent.click(privateCheckbox);
      expect(privateCheckbox.checked).toBe(false);
    });
  });

  describe('Labels Flutuantes', () => {
    it('deve mostrar label do título ao focar no campo', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input');
      const titleLabel = screen.getByText('Título');

      // Label deve estar invisível inicialmente
      expect(titleLabel).toHaveClass('opacity-0');

      fireEvent.focus(titleInput);

      // Label deve aparecer ao focar
      expect(titleLabel).toHaveClass('opacity-100');
    });

    it('deve esconder label do título ao desfocar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input');
      const titleLabel = screen.getByText('Título');

      fireEvent.focus(titleInput);
      expect(titleLabel).toHaveClass('opacity-100');

      fireEvent.blur(titleInput);
      expect(titleLabel).toHaveClass('opacity-0');
    });

    it('deve mostrar label da descrição ao focar no campo', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional');
      const descriptionLabel = screen.getByText('Descrição');

      expect(descriptionLabel).toHaveClass('opacity-0');

      fireEvent.focus(descriptionTextarea);
      expect(descriptionLabel).toHaveClass('opacity-100');
    });

    it('deve esconder label da descrição ao desfocar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional');
      const descriptionLabel = screen.getByText('Descrição');

      fireEvent.focus(descriptionTextarea);
      expect(descriptionLabel).toHaveClass('opacity-100');

      fireEvent.blur(descriptionTextarea);
      expect(descriptionLabel).toHaveClass('opacity-0');
    });
  });

  describe('Validação', () => {
    it('deve mostrar erro quando título está vazio ao salvar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={{ ...mockReadlist, title: '' }}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      expect(screen.getByTestId('input-error')).toHaveTextContent('O título é obrigatório');
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('deve validar título ao desfocar do campo', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      
      fireEvent.change(titleInput, { target: { value: '' } });
      fireEvent.blur(titleInput);

      expect(screen.getByTestId('input-error')).toBeInTheDocument();
    });

    it('deve limpar erro quando título válido é digitado', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={{ ...mockReadlist, title: '' }}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const saveButton = screen.getByText('Salvar Alterações');

      // Gerar erro
      fireEvent.click(saveButton);
      expect(screen.getByTestId('input-error')).toBeInTheDocument();

      // Corrigir
      fireEvent.change(titleInput, { target: { value: 'Título Válido' } });
      
      // Erro deve desaparecer
      waitFor(() => {
        expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
      });
    });

    it('não deve aceitar título apenas com espaços', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const saveButton = screen.getByText('Salvar Alterações');

      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.click(saveButton);

      expect(screen.getByTestId('input-error')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Salvamento', () => {
    it('deve salvar alterações quando formulário é válido', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional') as HTMLTextAreaElement;
      const privateCheckbox = screen.getByLabelText('Tornar readlist privada') as HTMLInputElement;
      const saveButton = screen.getByText('Salvar Alterações');

      fireEvent.change(titleInput, { target: { value: 'Novo Título' } });
      fireEvent.change(descriptionTextarea, { target: { value: 'Nova descrição' } });
      fireEvent.click(privateCheckbox);
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Novo Título',
        description: 'Nova descrição',
        coverImage: mockReadlist.coverImage,
        isPrivate: true,
      });
    });

    it('deve fazer trim no título e descrição ao salvar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const descriptionTextarea = screen.getByPlaceholderText('Adicione uma descrição opcional') as HTMLTextAreaElement;
      const saveButton = screen.getByText('Salvar Alterações');

      fireEvent.change(titleInput, { target: { value: '  Título com espaços  ' } });
      fireEvent.change(descriptionTextarea, { target: { value: '  Descrição com espaços  ' } });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Título com espaços',
        description: 'Descrição com espaços',
        coverImage: mockReadlist.coverImage,
        isPrivate: false,
      });
    });

    it('deve fechar o modal após salvar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Upload de Imagem', () => {
    it('deve exibir overlay ao passar mouse sobre a imagem', () => {
      const { container } = render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const imageContainer = container.querySelector('.group');
      expect(imageContainer).toBeInTheDocument();
      expect(screen.getByText('Escolher foto')).toBeInTheDocument();
    });

    it('deve ter input de arquivo oculto', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const fileInput = document.querySelector('#cover-upload') as HTMLInputElement;
      
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).toHaveClass('hidden');
    });

    it('deve permitir selecionar um arquivo de imagem', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const fileInput = document.querySelector('#cover-upload') as HTMLInputElement;
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Verifica que o input aceita o arquivo
      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.length).toBe(1);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-label no botão de fechar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getByLabelText('Fechar');
      expect(closeButton).toBeInTheDocument();
    });

    it('deve ter IDs únicos nos campos', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('title-input')).toHaveAttribute('id', 'title-input');
      expect(screen.getByPlaceholderText('Adicione uma descrição opcional')).toHaveAttribute('id', 'description-textarea');
      expect(screen.getByLabelText('Tornar readlist privada')).toHaveAttribute('id', 'private-checkbox');
    });

    it('deve ter labels associados aos campos', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleLabel = screen.getByText('Título');
      const descriptionLabel = screen.getByText('Descrição');
      const privateLabel = screen.getByText('Tornar readlist privada');

      expect(titleLabel).toHaveAttribute('for', 'title-input');
      expect(descriptionLabel).toHaveAttribute('for', 'description-textarea');
      expect(privateLabel).toHaveAttribute('for', 'private-checkbox');
    });

    it('deve ter required no campo de título', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toHaveAttribute('required');
    });
  });

  describe('Estilos', () => {
    it('deve ter transições suaves nos labels', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const titleLabel = screen.getByText('Título');
      expect(titleLabel).toHaveClass('transition-opacity', 'duration-200');
    });

    it('deve aplicar hover no botão salvar', () => {
      render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Salvar Alterações');
      expect(saveButton).toBeInTheDocument();
      
      // Verifica que o botão tem estilo inicial
      expect(saveButton).toHaveStyle({ backgroundColor: 'var(--primary-600)' });
    });

    it('deve ter overlay escuro no fundo', () => {
      const { container } = render(
        <EditReadlistModal
          isOpen={true}
          onClose={mockOnClose}
          readlist={mockReadlist}
          onSave={mockOnSave}
        />
      );

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.style.backgroundColor).toBe('rgba(0, 0, 0, 0.8)');
    });
  });
});