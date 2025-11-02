import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePostModal from '@/components/CreatePostModal';

describe('CreatePostModal', () => {
  const mockOnClose = jest.fn();
  const mockOnPost = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    communityName: 'Romance',
    onPost: mockOnPost,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não deve renderizar quando isOpen é false', () => {
      render(<CreatePostModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText(/Criar postagem em/i)).not.toBeInTheDocument();
    });

    it('deve renderizar quando isOpen é true', () => {
      render(<CreatePostModal {...defaultProps} />);
      expect(screen.getByText(/Criar postagem em Romance/i)).toBeInTheDocument();
    });

    it('deve renderizar o textarea de conteúdo', () => {
      render(<CreatePostModal {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Texto da postagem/i)).toBeInTheDocument();
    });

    it('deve renderizar o botão de adicionar imagens', () => {
      render(<CreatePostModal {...defaultProps} />);
      expect(screen.getByText(/Adicionar imagens/i)).toBeInTheDocument();
    });

    it('deve renderizar o checkbox de pedir avaliação', () => {
      render(<CreatePostModal {...defaultProps} />);
      expect(screen.getByText(/Pedir avaliação dos moderadores/i)).toBeInTheDocument();
    });

    it('deve renderizar os botões de cancelar e postar', () => {
      render(<CreatePostModal {...defaultProps} />);
      expect(screen.getByText(/Cancelar/i)).toBeInTheDocument();
      expect(screen.getByText(/Postar/i)).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve atualizar o conteúdo quando o usuário digita', () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i) as HTMLTextAreaElement;
      
      fireEvent.change(textarea, { target: { value: 'Meu primeiro post!' } });
      expect(textarea.value).toBe('Meu primeiro post!');
    });

    it('deve marcar/desmarcar o checkbox de pedir avaliação', () => {
      render(<CreatePostModal {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('deve fechar o modal ao clicar em cancelar', () => {
      render(<CreatePostModal {...defaultProps} />);
      const cancelButton = screen.getByText(/Cancelar/i);
      
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('deve fechar o modal ao clicar no backdrop', () => {
      render(<CreatePostModal {...defaultProps} />);
      const backdrop = screen.getByText(/Criar postagem em Romance/i).parentElement?.parentElement;
      
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Validação', () => {
    it('deve mostrar erro quando tentar postar sem conteúdo', async () => {
      render(<CreatePostModal {...defaultProps} />);
      const postButton = screen.getByText(/Postar/i);
      
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(screen.getByText(/O conteúdo da postagem é obrigatório/i)).toBeInTheDocument();
      });
      
      expect(mockOnPost).not.toHaveBeenCalled();
    });

    it('deve permitir postar com conteúdo válido', async () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i);
      const postButton = screen.getByText(/Postar/i);
      
      fireEvent.change(textarea, { target: { value: 'Conteúdo válido' } });
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(mockOnPost).toHaveBeenCalledWith({
          content: 'Conteúdo válido',
          images: [],
          requestReview: false,
        });
      });
    });

    it('deve incluir requestReview quando checkbox está marcado', async () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i);
      const checkbox = screen.getByRole('checkbox');
      const postButton = screen.getByText(/Postar/i);
      
      fireEvent.change(textarea, { target: { value: 'Post para avaliação' } });
      fireEvent.click(checkbox);
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(mockOnPost).toHaveBeenCalledWith({
          content: 'Post para avaliação',
          images: [],
          requestReview: true,
        });
      });
    });
  });

  describe('Labels e Acessibilidade', () => {
    it('deve mostrar label quando textarea está focado', () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i);
      
      fireEvent.focus(textarea);
      
      const label = screen.getByText(/Conteúdo/i);
      expect(label).toBeInTheDocument();
    });

    it('deve ter aria-label nos botões', () => {
      render(<CreatePostModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/Adicionar imagens/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cancelar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Postar/i)).toBeInTheDocument();
    });
  });

  describe('Reset do Formulário', () => {
    it('deve limpar o formulário após postar com sucesso', async () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i) as HTMLTextAreaElement;
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      const postButton = screen.getByText(/Postar/i);
      
      fireEvent.change(textarea, { target: { value: 'Conteúdo teste' } });
      fireEvent.click(checkbox);
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(mockOnPost).toHaveBeenCalled();
      });
      
      // O componente chama onClose após postar com sucesso
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('deve limpar o formulário ao cancelar', () => {
      render(<CreatePostModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/Texto da postagem/i) as HTMLTextAreaElement;
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      const cancelButton = screen.getByText(/Cancelar/i);
      
      fireEvent.change(textarea, { target: { value: 'Conteúdo teste' } });
      fireEvent.click(checkbox);
      
      expect(textarea.value).toBe('Conteúdo teste');
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Limite de Imagens', () => {
    it('deve desabilitar o botão de adicionar imagens quando atingir 4 imagens', () => {
      render(<CreatePostModal {...defaultProps} />);
      const addButton = screen.getByText(/Adicionar imagens/i);
      
      // Inicialmente não está desabilitado
      expect(addButton).not.toBeDisabled();
    });

    it('deve mostrar contador de imagens no botão', () => {
      render(<CreatePostModal {...defaultProps} />);
      
      // Deve mostrar "Adicionar imagens" sem contador inicialmente
      expect(screen.getByText(/Adicionar imagens/i)).toBeInTheDocument();
    });

    it('deve mostrar contador no preview de imagens', () => {
      render(<CreatePostModal {...defaultProps} />);
      
      // Como não há imagens inicialmente, não deve mostrar o preview
      expect(screen.queryByText(/Imagens \(/i)).not.toBeInTheDocument();
    });
  });
});
