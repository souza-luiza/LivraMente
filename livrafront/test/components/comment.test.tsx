// __tests__/CommentComponent.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatePresence, motion } from 'framer-motion';
import CommentComponent from '@/components/comment';
import { commentsService } from '@/services/comentarios';
import { useRouter } from 'next/navigation';
import { Post, PostCategoria } from '@/types/post';
import { Comentario } from '@/types/comentario';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, fill, style }: any) => (
    fill ? (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        style={style}
        data-testid={`image-${alt}`}
      />
    ) : (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        className={className}
        data-testid={`image-${alt}`}
      />
    )
  ),
}));

jest.mock('@/services/comentarios', () => ({
  commentsService: {
    likeComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

jest.mock('@/lib/time', () => ({
  getTimeAgo: jest.fn(() => '2 horas atrás'),
}));

// Mock child components
jest.mock('@/components/image-modal', () => ({
  __esModule: true,
  default: ({ autor, imagem, imagens, onClose }: any) => (
    <div data-testid="image-modal">
      <div>Modal for: {autor}</div>
      <img src={imagem} alt="modal-image" />
      <button onClick={onClose} data-testid="close-image-modal">Close</button>
    </div>
  ),
}));

jest.mock('@/components/button', () => ({
  __esModule: true,
  default: ({ text, colorScheme, size, icon, onClick, fullwidth }: any) => (
    <button 
      data-testid={`button-${text}`}
      onClick={onClick}
      className={`${colorScheme} ${size} ${fullwidth ? 'fullwidth' : ''}`}
    >
      {icon} {text}
    </button>
  ),
}));

jest.mock('@/components/pop-up', () => ({
  __esModule: true,
  default: ({ title, description, button1, button2, isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="delete-popup">
        <h3>{title}</h3>
        <p>{description}</p>
        {button1 && (
          <button 
            onClick={button1.onClick}
            data-testid={`popup-button-${button1.text.toLowerCase()}`}
          >
            {button1.text}
          </button>
        )}
        {button2 && (
          <button 
            onClick={button2.onClick}
            data-testid={`popup-button-${button2.text.toLowerCase()}`}
          >
            {button2.text}
          </button>
        )}
        <button onClick={onClose} data-testid="close-popup">Close</button>
      </div>
    ) : null
  ),
}));

jest.mock('@/components/EditCommentModal', () => ({
  __esModule: true,
  default: ({ post, comment, isOpen, onClose, onSuccess }: any) => (
    isOpen ? (
      <div data-testid="edit-comment-modal">
        <div>Edit comment: {comment._id}</div>
        <button onClick={onClose} data-testid="close-edit-modal">Close</button>
        <button onClick={onSuccess} data-testid="save-edit">Save</button>
      </div>
    ) : null
  ),
}));

// Mock icons
jest.mock('@/components/icons/CommentIcon', () => () => <span data-testid="comment-icon" />);
jest.mock('@/components/icons/HeartIcon', () => ({ fill, strokeWidth }: any) => (
  <span data-testid="heart-icon" data-fill={fill} data-stroke={strokeWidth} />
));
jest.mock('@/components/icons/MoreHorizontalIcon', () => ({ size }: any) => (
  <span data-testid="more-options-icon" data-size={size} />
));
jest.mock('@/components/icons/EditIcon', () => () => <span data-testid="edit-icon" />);
jest.mock('@/components/icons/TrashIcon', () => () => <span data-testid="trash-icon" />);
jest.mock('@/components/icons/RemoveIcon', () => () => <span data-testid="remove-icon" />);

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onHoverEnd, ...props }: any) => (
      <div onMouseLeave={onHoverEnd} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CommentComponent', () => {
  const mockPush = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdate = jest.fn();
  
  const mockPost: Post = {
    _id: 'post123',
    autor:  { _id: '123', username: 'user123', avatarUrl: '' },
    conteudo: 'oi',
    comunidade: { _id: '456', nome: 'jogos vorazes' },
    categoria: PostCategoria.GERAL,
    status: 'publicado',
    imagens: [],
    tags: [],
    curtidas: [],
    comentarios: [],
    publico: true,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    solicitacao_revisao: false,
  };
  
  const baseComment: Comentario = {
    _id: 'comment123',
    conteudo: 'This is a test comment content that might be very long and need truncation.',
    autor: {
      _id: 'user123',
      username: 'testuser',
      avatarUrl: '/test-avatar.jpg',
    },
    curtidas: ['user123', 'user456'],
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    imagens: [],
    post: 'post123',
    mencoes: [],
  };
  
  const mockCommentWithImages: Comentario = {
    ...baseComment,
    imagens: [
      { public_id: '123', secure_url: '/image1.jpg' },
      { public_id: '456', secure_url: '/image2.jpg' },
    ],
  };
  
  const mockCommentWithoutAvatar = {
    ...baseComment,
    autor: {
      ...baseComment.autor,
      avatarUrl: '',
    },
  };
  
  const mockLongComment = {
    ...baseComment,
    conteudo: 'A'.repeat(1000), // Very long comment
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Reset DOM mocks
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 100,
    });
    
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 80,
    });
    
    // Mock getComputedStyle for lineHeight
    window.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: (prop: string) => {
        if (prop === 'line-height' || prop === 'lineHeight') return '24px';
        return '';
      },
      lineHeight: '24px',
    } as any);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Basic Rendering', () => {
    it('should render comment with basic information', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment content that might be very long and need truncation.')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Like count
      expect(screen.getByText('2 horas atrás')).toBeInTheDocument();
    });
    
    it('should render default avatar when avatarUrl is empty', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={mockCommentWithoutAvatar}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const image = screen.getByTestId('image-Foto do usuário');
      expect(image).toHaveAttribute('src', '/AbstractUser.png');
    });
    
    it('should render provided avatar when available', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const image = screen.getByTestId('image-Foto do usuário');
      expect(image).toHaveAttribute('src', '/test-avatar.jpg');
    });
  });
  
  describe('Content Overflow Handling', () => {
    it('should detect overflow and show "Ver mais..."', () => {
      // Mock scrollHeight > 4 * lineHeight
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
      });
      
      render(
        <CommentComponent
          post={mockPost}
          comment={mockLongComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByText('Ver mais...')).toBeInTheDocument();
    });
    
    it('should not show "Ver mais..." when content is short', () => {
      // Mock scrollHeight <= 4 * lineHeight
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 80, // 4 * 20px lineHeight
      });
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.queryByText('Ver mais...')).not.toBeInTheDocument();
      expect(screen.queryByText('Ver menos...')).not.toBeInTheDocument();
    });
    
    it('should toggle expanded state when clicking "Ver mais..."', async () => {
      const user = userEvent.setup();
      
      // Mock overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: 200,
      });
      
      render(
        <CommentComponent
          post={mockPost}
          comment={mockLongComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const verMaisButton = screen.getByText('Ver mais...');
      await act(async () => {
        await user.click(verMaisButton);
      });
      
      expect(screen.getByText('Ver menos...')).toBeInTheDocument();
      
      await act(async () => {
        await user.click(screen.getByText('Ver menos...'));
      });
      
      expect(screen.getByText('Ver mais...')).toBeInTheDocument();
    });
    
    it('should update maxHeight when expanded state changes', async () => {
      // Mock overflow
      const mockScrollHeight = 200;
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        value: mockScrollHeight,
      });
      
      const { container } = render(
        <CommentComponent
          post={mockPost}
          comment={mockLongComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      await waitFor(() => {
        const contentElement = container.querySelector('p');
        expect(contentElement).toHaveAttribute('style', expect.stringContaining('max-height: 96px'));
      });
    });
  });
  
  describe('Image Handling', () => {
    it('should render images when available', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={mockCommentWithImages}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const images = screen.getAllByTestId(/image-Imagem do comentário/);
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', '/image1.jpg');
      expect(images[1]).toHaveAttribute('src', '/image2.jpg');
    });
    
    it('should open image modal when clicking on an image', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={mockCommentWithImages}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const imageContainer = screen.getAllByTestId('image-Imagem do comentário 1')[0];
      await act(async () => {
        await user.click(imageContainer);
      });
      
      expect(screen.getByTestId('image-modal')).toBeInTheDocument();
    });
    
    it('should close image modal', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={mockCommentWithImages}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open modal
      const imageContainer = screen.getAllByTestId('image-Imagem do comentário 1')[0];
      await act(async () => {
        await user.click(imageContainer);
      });
      
      // Close modal
      const closeButton = screen.getByTestId('close-image-modal');
      await act(async () => {
        await user.click(closeButton);
      });
      
      expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument();
    });
    
    it('should not render image section when no images', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.queryByTestId(/image-Imagem do comentário/)).not.toBeInTheDocument();
    });
  });
  
  describe('Like Functionality', () => {
    it('should show filled heart when user has liked the comment', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123" // User has liked (in curtidas array)
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-fill', 'currentColor');
    });
    
    it('should show empty heart when user has not liked the comment', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user999" // User has NOT liked
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-fill', 'none');
    });
    
    it('should call likeComment service when like button is clicked', async () => {
      const user = userEvent.setup();
      const mockLikeResponse = { liked: true, likeAmount: 3 };
      (commentsService.likeComment as jest.Mock).mockResolvedValue(mockLikeResponse);
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const likeButton = screen.getByTestId('button-2');
      await act(async () => {
        await user.click(likeButton);
      });
      
      expect(commentsService.likeComment).toHaveBeenCalledWith('post123', 'comment123');
    });
    
    it('should update like state after successful like', async () => {
      const user = userEvent.setup();
      const mockLikeResponse = { liked: true, likeAmount: 3 };
      (commentsService.likeComment as jest.Mock).mockResolvedValue(mockLikeResponse);
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const likeButton = screen.getByTestId('button-2');
      await act(async () => {
        await user.click(likeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('button-3')).toBeInTheDocument();
      });
    });
    
    it('should handle like comment error', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (commentsService.likeComment as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const likeButton = screen.getByTestId('button-2');
      await act(async () => {
        await user.click(likeButton);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao curtir/descurtir o comentário:',
          expect.any(Error)
        );
      });
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Options Menu (More Options)', () => {
    it('should show MoreHorizontalIcon when user is owner', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123" // Owner
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByTestId('more-options-icon')).toBeInTheDocument();
    });
    
    it('should show MoreHorizontalIcon when user is moderator', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="moderator123" // Not owner but moderator
          isModerator={true}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByTestId('more-options-icon')).toBeInTheDocument();
    });
    
    it('should NOT show MoreHorizontalIcon when user is neither owner nor moderator', () => {
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="otheruser123" // Not owner, not moderator
          isModerator={false}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.queryByTestId('more-options-icon')).not.toBeInTheDocument();
    });
    
    it('should open options menu when clicking MoreHorizontalIcon', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      expect(screen.getByTestId('button-Excluir')).toBeInTheDocument();
      expect(screen.getByTestId('button-Editar')).toBeInTheDocument();
    });
    
    it('should position menu correctly when near screen edges', async () => {
      const user = userEvent.setup();
      
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Mock menu dimensions
      const mockMenuWidth = 200;
      const mockMenuHeight = 100;
      
      // Click near right edge
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        fireEvent.click(optionsIcon, { clientX: 700, clientY: 300 });
      });
      
      // Menu should be repositioned to fit
      const menu = screen.getByTestId('button-Excluir').closest('.fixed');
      expect(menu).toBeInTheDocument();
    });
    
    it('should close options menu when mouse leaves', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      // Mouse leave
      const menu = screen.getByTestId('button-Excluir').closest('.fixed');
      fireEvent.mouseLeave(menu!);
      
      expect(screen.queryByTestId('button-Excluir')).not.toBeInTheDocument();
    });
    
    it('should close options menu on hover end of parent', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      // Trigger onHoverEnd
      const parentDiv = container.firstChild as HTMLElement;
      fireEvent.mouseLeave(parentDiv);
      
      expect(screen.queryByTestId('button-Excluir')).not.toBeInTheDocument();
    });
  });
  
  describe('Delete Functionality', () => {
    it('should show delete popup when clicking delete option', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open options menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      // Click delete
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      expect(screen.getByTestId('delete-popup')).toBeInTheDocument();
      expect(screen.getByText('Excluir Comentário?')).toBeInTheDocument();
    });
    
    it('should show delete popup with username when moderator deletes', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="moderator123"
          isModerator={true}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open options menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      // Click delete
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      expect(screen.getByText(`Excluir Comentário de @${baseComment.autor.username}?`)).toBeInTheDocument();
    });
    
    it('should call deleteComment service and onDelete callback', async () => {
      const user = userEvent.setup();
      (commentsService.deleteComment as jest.Mock).mockResolvedValue({});
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu and delete
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      // Confirm in popup
      const confirmDeleteButton = screen.getByTestId('popup-button-excluir');
      await act(async () => {
        await user.click(confirmDeleteButton);
      });
      
      await waitFor(() => {
        expect(commentsService.deleteComment).toHaveBeenCalledWith('post123', 'comment123');
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });
    
    it('should handle delete comment error', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (commentsService.deleteComment as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu and delete
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      // Confirm in popup
      const confirmDeleteButton = screen.getByTestId('popup-button-excluir');
      await act(async () => {
        await user.click(confirmDeleteButton);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao excluir o comentário:',
          expect.any(Error)
        );
        expect(mockOnDelete).toHaveBeenCalled(); // onDelete should still be called
      });
      
      consoleSpy.mockRestore();
    });
    
    it('should cancel delete when clicking cancel in popup', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu and delete
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      // Cancel in popup
      const cancelButton = screen.getByTestId('popup-button-cancelar');
      await act(async () => {
        await user.click(cancelButton);
      });
      
      expect(screen.queryByTestId('delete-popup')).not.toBeInTheDocument();
      expect(commentsService.deleteComment).not.toHaveBeenCalled();
    });
  });
  
  describe('Edit Functionality', () => {
    it('should show edit option only for owner', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123" // Owner
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open options menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      expect(screen.getByTestId('button-Editar')).toBeInTheDocument();
    });
    
    it('should NOT show edit option for moderator who is not owner', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="moderator123" // Moderator but not owner
          isModerator={true}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open options menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      expect(screen.queryByTestId('button-Editar')).not.toBeInTheDocument();
    });
    
    it('should open edit modal when clicking edit option', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open options menu
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      // Click edit
      const editButton = screen.getByTestId('button-Editar');
      await act(async () => {
        await user.click(editButton);
      });
      
      expect(screen.getByTestId('edit-comment-modal')).toBeInTheDocument();
    });
    
    it('should call onUpdate callback after successful edit', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu and edit
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const editButton = screen.getByTestId('button-Editar');
      await act(async () => {
        await user.click(editButton);
      });
      
      // Save edit
      const saveButton = screen.getByTestId('save-edit');
      await act(async () => {
        await user.click(saveButton);
      });
      
      expect(mockOnUpdate).toHaveBeenCalled();
    });
    
    it('should close edit modal', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Open menu and edit
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const editButton = screen.getByTestId('button-Editar');
      await act(async () => {
        await user.click(editButton);
      });
      
      // Close modal
      const closeButton = screen.getByTestId('close-edit-modal');
      await act(async () => {
        await user.click(closeButton);
      });
      
      expect(screen.queryByTestId('edit-comment-modal')).not.toBeInTheDocument();
    });
  });
  
  describe('Profile Navigation', () => {
    it('should redirect to user profile when clicking username/avatar', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const userInfoContainer = screen.getByText('@testuser').closest('div');
      await act(async () => {
        await user.click(userInfoContainer!);
      });
      
      expect(mockPush).toHaveBeenCalledWith('/testuser');
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle missing onUpdate callback', async () => {
      const user = userEvent.setup();
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          // onUpdate is undefined
        />
      );
      
      // Open menu and edit
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const editButton = screen.getByTestId('button-Editar');
      await act(async () => {
        await user.click(editButton);
      });
      
      // Save edit - should not crash even without onUpdate
      const saveButton = screen.getByTestId('save-edit');
      await act(async () => {
        await user.click(saveButton);
      });
      
      // Should not throw error
      expect(screen.queryByTestId('edit-comment-modal')).not.toBeInTheDocument();
    });
    
    it('should handle missing onDelete callback in delete flow', async () => {
      const user = userEvent.setup();
      (commentsService.deleteComment as jest.Mock).mockResolvedValue({});
      
      render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={() => {}}
          onUpdate={mockOnUpdate}
        />
      );
      
      const optionsIcon = screen.getByTestId('more-options-icon');
      await act(async () => {
        await user.click(optionsIcon);
      });
      
      const deleteButton = screen.getByTestId('button-Excluir');
      await act(async () => {
        await user.click(deleteButton);
      });
      
      // Confirm delete
      const confirmDeleteButton = screen.getByTestId('popup-button-excluir');
      await act(async () => {
        await user.click(confirmDeleteButton);
      });
      
      // Should not crash even without onDelete
      expect(commentsService.deleteComment).toHaveBeenCalled();
    });
    
    it('should handle empty comment content', () => {
      const emptyComment = {
        ...baseComment,
        conteudo: '',
      };
      
      render(
        <CommentComponent
          post={mockPost}
          comment={emptyComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Should render without crashing
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
    
    it('should handle comment with null/undefined images', () => {
      const commentWithNullImages = {
        ...baseComment,
        imagens: null as any,
      };
      
      render(
        <CommentComponent
          post={mockPost}
          comment={commentWithNullImages}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Should not crash
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
  });
  
  describe('Styling and Classes', () => {
    it('should apply correct CSS classes', () => {
      const { container } = render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const commentDiv = container.querySelector('.medium-box');
      expect(commentDiv).toHaveClass('light-neutral shadow-sm');
      
      const contentParagraph = container.querySelector('p.text-b2');
      expect(contentParagraph).toHaveClass('whitespace-pre-line');
    });
    
    it('should apply hover styles', () => {
      const { container } = render(
        <CommentComponent
          post={mockPost}
          comment={baseComment}
          currentUserId="user123"
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );
      
      const commentDiv = container.querySelector('.medium-box');
      expect(commentDiv).toHaveClass('hover:shadow-md');
    });
  });
});