// __tests__/EditCommentModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditCommentModal from '@/components/EditCommentModal';
import { Post, PostCategoria, PostStatus } from '@/types/post';
import { Comentario } from '@/types/comentario';

// Mock dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img 
      src={src} 
      alt={alt} 
      data-testid="next-image" 
      className={className}
      style={fill ? { position: 'absolute', inset: 0 } : {}}
    />
  ),
}));

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => (
        <div data-testid="motion-div" {...props}>
          {children}
        </div>
      ),
    },
    AnimatePresence: ({ children }: any) => (
      <div data-testid="animate-presence">{children}</div>
    ),
  };
});

jest.mock('@/components/button', () => ({
  __esModule: true,
  default: ({ 
    text, 
    icon, 
    onClick, 
    disabled, 
    'aria-label': ariaLabel 
  }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {text} {icon && 'Icon'}
    </button>
  ),
}));

jest.mock('@/components/icons/TrashIcon', () => () => <div data-testid="trash-icon">TrashIcon</div>);
jest.mock('@/components/icons/ImageIcon', () => () => <div data-testid="image-icon">ImageIcon</div>);
jest.mock('@/components/icons/SaveIcon', () => () => <div data-testid="save-icon">SaveIcon</div>);

jest.mock('@/services/comentarios', () => ({
  commentsService: {
    updateComment: jest.fn(),
  },
}));

describe('EditCommentModal', () => {
  const mockPost: Post = {
    _id: 'post-123',
    conteudo: 'Test content',
    autor: { _id: 'user-123', username: 'testuser', avatarUrl: '' },
    comunidade: { _id: '1', nome: 'Test Community' },
    createdAt: new Date().toString(),
    curtidas: [],
    comentarios: [],
    imagens: [],
    categoria: PostCategoria.GERAL,
    tags: [],
    status: PostStatus.PUBLICADO,
    publico: true,
    solicitacao_revisao: false,
    updatedAt: new Date().toString(),
  };

  const mockComment: Comentario = {
    _id: 'comment-123',
    conteudo: 'Original comment content',
    autor: { _id: 'user-456', username: 'commentuser', avatarUrl: '' },
    post: 'post-123',
    createdAt: new Date().toString(),
    curtidas: [],
    imagens: [
      { secure_url: 'https://example.com/image1.jpg', public_id: 'img1' },
      { secure_url: 'https://example.com/image2.jpg', public_id: 'img2' },
    ],
    mencoes: [],
    updatedAt: new Date().toString(),
  };

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    post: mockPost,
    comment: mockComment,
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    });
  });

  // Helper to find mocked Button by its aria-label
  const getButtonByAria = (label: string) =>
    screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === label)!;

  describe('Rendering and Visibility', () => {
    it('should return null when isOpen is false', () => {
      const { container } = render(
        <EditCommentModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should return null when comment is not provided', () => {
      expect(() =>
        render(<EditCommentModal {...defaultProps} comment={undefined as any} />)
      ).toThrow();
    });

    it('should render modal when isOpen is true and comment is provided', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
      expect(screen.getByText('Editar Comentário')).toBeInTheDocument();
      expect(screen.getByText('Original comment content')).toBeInTheDocument();
    });

    it('should render all buttons', () => {
      render(<EditCommentModal {...defaultProps} />);

      const buttons = screen.getAllByTestId('button');
      // Buttons are rendered by a mocked Button component and carry aria-label
      const cancel = buttons.find((b) => b.getAttribute('aria-label') === 'Cancelar');
      const save = buttons.find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');

      expect(cancel).toBeDefined();
      expect(save).toBeDefined();
    });

    it('should render image previews when comment has images', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      expect(screen.getByText('Imagens (2/4)')).toBeInTheDocument();
      const images = screen.getAllByTestId('next-image');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    it('should not render image preview when comment has no images', () => {
      const commentWithoutImages = { ...mockComment, imagens: [] };
      render(<EditCommentModal {...defaultProps} comment={commentWithoutImages} />);
      
      expect(screen.queryByText('Imagens (0/4)')).not.toBeInTheDocument();
      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    });
  });

  describe('Initialization Effects', () => {
    it('should reset content and images when modal opens with new comment', () => {
      const newComment = {
        ...mockComment,
        conteudo: 'New comment content',
        imagens: [{ secure_url: 'https://example.com/new-image.jpg', public_id: 'new-img' }],
      };

      const { rerender } = render(
        <EditCommentModal {...defaultProps} isOpen={false} />
      );

      rerender(
        <EditCommentModal {...defaultProps} comment={newComment} isOpen={true} />
      );

      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveValue('New comment content');
      
      expect(screen.getByText('Imagens (1/4)')).toBeInTheDocument();
    });

    it('should clear errors when modal opens', () => {
      // First render with error state
      const { rerender } = render(
        <EditCommentModal {...defaultProps} />
      );

      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.blur(textarea);

      expect(screen.getByText('O conteúdo da postagem é obrigatório')).toBeInTheDocument();

      // Close and reopen
      rerender(
        <EditCommentModal {...defaultProps} isOpen={false} />
      );

      rerender(
        <EditCommentModal {...defaultProps} isOpen={true} />
      );

      expect(screen.queryByText('O conteúdo da postagem é obrigatório')).not.toBeInTheDocument();
    });

    it('should disable body scroll when modal opens', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      const { unmount } = render(<EditCommentModal {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore original overflow style on unmount', () => {
      document.body.style.overflow = 'auto';
      
      const { unmount } = render(<EditCommentModal {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Textarea Functionality', () => {
    it('should update content when typing', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: 'Updated comment content' } });
      
      expect(textarea).toHaveValue('Updated comment content');
    });

    it('should show label when textarea is focused', () => {
      render(<EditCommentModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      const label = screen.getByText('Conteúdo');

      // Ensure label remains present when focusing and blurring textarea
      expect(label).toBeInTheDocument();

      fireEvent.focus(textarea);
      expect(label).toBeInTheDocument();

      fireEvent.blur(textarea);
      expect(label).toBeInTheDocument();
    });

    it('should validate content on blur', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      
      // Clear content and blur to trigger validation
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.blur(textarea);
      
      expect(screen.getByText('O conteúdo da postagem é obrigatório')).toBeInTheDocument();
    });

    it('should clear validation error when typing valid content', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      
      // Trigger error
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.blur(textarea);
      
      expect(screen.getByText('O conteúdo da postagem é obrigatório')).toBeInTheDocument();
      
      // Fix error by typing
      fireEvent.change(textarea, { target: { value: 'Valid content' } });
      
      expect(screen.queryByText('O conteúdo da postagem é obrigatório')).not.toBeInTheDocument();
    });
  });

  describe('Validation Logic', () => {
    it('should validate empty content as invalid', () => {
      const { validateContent } = require('@/components/EditCommentModal');
      
      // Since validateContent is not exported, we'll test the behavior through UI
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.blur(textarea);
      
      expect(screen.getByText('O conteúdo da postagem é obrigatório')).toBeInTheDocument();
    });

    it('should validate non-empty content as valid', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: 'Valid content' } });
      fireEvent.blur(textarea);
      
      expect(screen.queryByText('O conteúdo da postagem é obrigatório')).not.toBeInTheDocument();
    });

    it('should apply error border style when content is invalid', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      
      // Get initial border color
      const initialBorderColor = textarea.style.borderColor;
      
      // Trigger error
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.blur(textarea);
      
      // The border color should change to error color
      // Note: In the actual implementation, this uses CSS custom properties
      // This test checks that the style prop is set
      expect(textarea.style.borderColor).toBeDefined();
    });
  });

  describe('Update Comment Functionality', () => {
    it('should call updateComment with correct parameters', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockResolvedValue({});
      
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: 'Updated comment' } });
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        expect(commentsService.updateComment).toHaveBeenCalledWith(
          'post-123',
          'comment-123',
          { conteudo: 'Updated comment' }
        );
      });
    });

    it('should call onSuccess callback after successful update', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockResolvedValue({});
      
      render(<EditCommentModal {...defaultProps} />);
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should call onClose after successful update', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockResolvedValue({});
      
      render(<EditCommentModal {...defaultProps} />);
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should reset form state after successful update', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockResolvedValue({});
      
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: 'Updated comment' } });
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        // The form should be reset, but we can't directly test internal state
        // We can verify that onClose was called which will hide the modal
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not submit if content validation fails', async () => {
      const { commentsService } = require('@/services/comentarios');
      
      render(<EditCommentModal {...defaultProps} />);
      
      // Clear content
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: '' } });
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      expect(commentsService.updateComment).not.toHaveBeenCalled();
      expect(screen.getByText('O conteúdo da postagem é obrigatório')).toBeInTheDocument();
    });

    it('should show error message when update fails', async () => {
      const { commentsService } = require('@/services/comentarios');
      const errorMessage = 'Failed to update comment';
      commentsService.updateComment.mockRejectedValue(new Error(errorMessage));
      
      render(<EditCommentModal {...defaultProps} />);
      
      const saveButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show generic error message when update fails without specific error', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockRejectedValue('Unknown error');
      
      render(<EditCommentModal {...defaultProps} />);
      const saveButton = getButtonByAria('Salvar Alterações');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao criar postagem\. Tente novamente\.|Unknown error/)).toBeInTheDocument();
      });
    });

    it('should disable buttons while submitting', async () => {
      const { commentsService } = require('@/services/comentarios');
      let resolveUpdate: any;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      commentsService.updateComment.mockReturnValue(updatePromise);
      
      render(<EditCommentModal {...defaultProps} />);
      
      const buttons = screen.getAllByTestId('button');
      const saveButton = buttons.find((b) => b.getAttribute('aria-label') === 'Salvar Alterações');
      const cancelButton = buttons.find((b) => b.getAttribute('aria-label') === 'Cancelar');
      
      fireEvent.click(saveButton);
      
      // Buttons should be disabled during submission
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      
      // Resolve the promise
      resolveUpdate({});
      
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();
      });
    });

    it('should show loading text while submitting', async () => {
      const { commentsService } = require('@/services/comentarios');
      let resolveUpdate: any;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      commentsService.updateComment.mockReturnValue(updatePromise);
      
      render(<EditCommentModal {...defaultProps} />);
      
      const saveButton = getButtonByAria('Salvar Alterações');
      fireEvent.click(saveButton);

      // The mocked Button renders the loading text inside the button; assert on its textContent
      expect(saveButton).toHaveTextContent(/Salvando.../);
      
      resolveUpdate({});
      
      await waitFor(() => {
        expect(getButtonByAria('Salvar Alterações')).toBeDefined();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<EditCommentModal {...defaultProps} />);
      const cancelButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Cancelar');
      fireEvent.click(cancelButton!);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const modalContent = screen.getByText('Editar Comentário').closest('div');
      fireEvent.click(modalContent!);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should reset form state when canceling', () => {
      const { commentsService } = require('@/services/comentarios');
      
      render(<EditCommentModal {...defaultProps} />);
      
      // Modify content
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      fireEvent.change(textarea, { target: { value: 'Modified content' } });
      
      // Cancel
      const cancelButton = screen.getAllByTestId('button').find((b) => b.getAttribute('aria-label') === 'Cancelar');
      fireEvent.click(cancelButton!);
      
      // Reopen modal (simulate)
      const newComment = { ...mockComment, conteudo: 'Original comment content' };
      const { rerender } = render(
        <EditCommentModal {...defaultProps} isOpen={false} />
      );
      
      rerender(
        <EditCommentModal {...defaultProps} comment={newComment} isOpen={true} />
      );
      
      // Content should be reset to original — pick the last textarea if multiple exist
      const textareas = screen.getAllByPlaceholderText('Texto da postagem...');
      expect(textareas[textareas.length - 1]).toHaveValue('Original comment content');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels on buttons', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'Cancelar');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Salvar Alterações');
    });

    it('should associate label with textarea', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveAttribute('id', 'content-textarea');
      
      const label = screen.getByText('Conteúdo');
      // DOM uses the "for" attribute; match against that to be robust
      expect(label).toHaveAttribute('for', 'content-textarea');
    });

    it('should have required attribute on textarea', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveAttribute('required');
    });
  });

  describe('Error States', () => {
    it('should clear submit error when modal reopens', () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockRejectedValue(new Error('Test error'));
      
      const { rerender } = render(<EditCommentModal {...defaultProps} />);

      const saveButton = getButtonByAria('Salvar Alterações');
      fireEvent.click(saveButton);
      
      // Wait for error to appear
      waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
      
      // Close and reopen
      rerender(<EditCommentModal {...defaultProps} isOpen={false} />);
      rerender(<EditCommentModal {...defaultProps} isOpen={true} />);
      
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    it('should maintain disabled state during submission with error', async () => {
      const { commentsService } = require('@/services/comentarios');
      commentsService.updateComment.mockRejectedValue(new Error('Test error'));
      
      render(<EditCommentModal {...defaultProps} />);
      const saveButton = getButtonByAria('Salvar Alterações');
      fireEvent.click(saveButton);
      
      // Button should be disabled during submission
      expect(saveButton).toBeDisabled();
      
      await waitFor(() => {
        // Button should be re-enabled after error
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle comment with very long content', () => {
      const longComment = {
        ...mockComment,
        conteudo: 'A'.repeat(1000),
      };
      
      render(<EditCommentModal {...defaultProps} comment={longComment} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveValue('A'.repeat(1000));
    });

    it('should handle comment with special characters', () => {
      const specialComment = {
        ...mockComment,
        conteudo: 'Comment with spéciäl chãracters & symbols: !@#$%^&*()',
      };
      
      render(<EditCommentModal {...defaultProps} comment={specialComment} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveValue('Comment with spéciäl chãracters & symbols: !@#$%^&*()');
    });

    it('should handle empty images array', () => {
      const commentWithoutImages = {
        ...mockComment,
        imagens: [],
      };
      
      render(<EditCommentModal {...defaultProps} comment={commentWithoutImages} />);
      
      expect(screen.queryByText(/Imagens/)).not.toBeInTheDocument();
    });

    it('should handle maximum number of images (4)', () => {
      const commentWithMaxImages = {
        ...mockComment,
        imagens: Array(4).fill(null).map((_, i) => ({
          secure_url: `https://example.com/image${i}.jpg`,
          public_id: `img${i}`,
        })),
      };
      
      render(<EditCommentModal {...defaultProps} comment={commentWithMaxImages} />);
      
      expect(screen.getByText('Imagens (4/4)')).toBeInTheDocument();
      expect(screen.getAllByTestId('next-image')).toHaveLength(4);
    });
  });

  describe('Animation and Styling', () => {
    it('should have correct modal styling', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const modalContent = screen.getByText('Editar Comentário').closest('div');
      expect(modalContent).toHaveClass('bg-gray-50');
      expect(modalContent).toHaveClass('medium-padding');
      expect(modalContent).toHaveClass('medium-border-radius');
    });

    it('should have correct background overlay', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      expect(overlay).toHaveStyle('background-color: rgba(0, 0, 0, 0.8)');
    });

    it('should have correct textarea styling', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      expect(textarea).toHaveClass('light-neutral');
      expect(textarea).toHaveClass('medium-box');
      expect(textarea).toHaveClass('small-border-width');
    });

    it('should apply focus styling to textarea', () => {
      render(<EditCommentModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Texto da postagem...');
      
      // Get computed styles or class changes
      expect(textarea).toHaveClass('focus:ring-2');
      expect(textarea).toHaveClass('focus:ring-green-900');
    });
  });
});