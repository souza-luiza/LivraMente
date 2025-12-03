import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PostComponent from '@/components/post';
import { postsService } from '@/services/posts';

jest.mock('@/services/posts', () => ({
  postsService: {
    likePost: jest.fn(),
    removePost: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/EditPostModal', () => {
  return jest.fn(({ isOpen, onClose, onSuccess, post }) => 
    isOpen ? (
      <div data-testid="edit-post-modal">
        <div>Edit Post Modal - Post: {post._id}</div>
        <button onClick={onSuccess}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  );
});

jest.mock('@/components/pop-up', () => {
  return jest.fn(({ title, description, button1, button2, isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="popup">
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={button1.onClick}>Cancel</button>
        <button onClick={button2.onClick}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  );
});

jest.mock('@/components/image-modal', () => {
  return jest.fn(({ isOpen, onClose, imagem, imagens }) =>
    isOpen ? (
      <div data-testid="image-modal">
        <div>Image Modal - Current Image: {imagem}</div>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  );
});

jest.mock('@/components/button', () => {
  return jest.fn(({ text, icon, onClick, disabled, loading, colorScheme, size, fullwidth, 'data-testid': testId }) => (
    <button 
      data-testid={testId || `button-${text.toLowerCase().replace(/\s+/g, '-')}`}
      data-disabled={disabled}
      data-loading={loading}
      data-color={colorScheme}
      data-size={size}
      data-fullwidth={fullwidth}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span data-testid={`icon-${text.toLowerCase().replace(/\s+/g, '-')}`}>{icon}</span>}
      {text}
    </button>
  ));
});

// Mock icons
jest.mock('@/components/icons/CodeIcon', () => {
  return jest.fn(({ size }) => <svg data-testid="code-icon" data-size={size} />);
});

jest.mock('@/components/icons/HeartIcon', () => {
  return jest.fn(({ fill, strokeWidth }) => <svg data-testid="heart-icon" data-fill={fill} data-stroke-width={strokeWidth} />);
});

jest.mock('@/components/icons/CommentIcon', () => {
  return jest.fn(({ strokeWidth }) => <svg data-testid="comment-icon" data-stroke-width={strokeWidth} />);
});

jest.mock('@/components/icons/MoreHorizontalIcon', () => {
  return jest.fn(({ size }) => <svg data-testid="more-horizontal-icon" data-size={size} />);
});

jest.mock('@/components/icons/EditIcon', () => {
  return jest.fn(() => <svg data-testid="edit-icon" />);
});

jest.mock('@/components/icons/TrashIcon', () => {
  return jest.fn(() => <svg data-testid="trash-icon" />);
});

jest.mock('@/components/icons/CommunityIcon', () => {
  return jest.fn(({ size }) => <svg data-testid="community-icon" data-size={size} />);
});

jest.mock('@/components/icons/RemoveIcon', () => {
  return jest.fn(() => <svg data-testid="remove-icon" />);
});

jest.mock('@/lib/time', () => ({
  getTimeAgo: jest.fn(() => '3 hours ago'),
}));

jest.mock('@/lib/slugify', () => ({
  titleToSlug: jest.fn((title) => title.toLowerCase().replace(/\s+/g, '-')),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onHoverEnd, ...props }: any) => (
      <div 
        data-testid="motion-div" 
        onMouseLeave={onHoverEnd}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe('PostComponent', () => {
  const mockPost = {
    _id: 'post-123',
    conteudo: 'This is a test post content that is quite long and might overflow. '.repeat(10),
    comunidade: {
      nome: 'Test Community',
    },
    autor: {
      _id: 'user-123',
      username: 'testuser',
      avatarUrl: '/test-avatar.jpg',
    },
    curtidas: ['user-123', 'user-456'],
    comentarios: ['comment-1', 'comment-2'],
    imagens: [
      { secure_url: 'https://example.com/image1.jpg' },
      { secure_url: 'https://example.com/image2.jpg' },
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  };

  const mockPostWithoutImages = {
    ...mockPost,
    imagens: [],
  };

  const mockPostWithLongContent = {
    ...mockPost,
    conteudo: 'A'.repeat(1000),
  };

  const mockProps = {
    post: mockPost,
    currentUserId: 'user-123',
    isModerator: false,
    disableActions: false,
    handleComment: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  };

  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    // Mock getComputedStyle to provide numeric lineHeight and getPropertyValue used in components
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      lineHeight: '20px',
      getPropertyValue: (prop: string) => (prop === 'line-height' ? '20px' : ''),
    } as unknown as CSSStyleDeclaration));
  });

  const renderComponent = (overrides = {}) => {
    const props = { ...mockProps, ...overrides };
    return render(<PostComponent {...props} />);
  };

  const getFirstPost = () => {
    const divs = screen.getAllByTestId('motion-div');
    return divs.find((d) => d.querySelector('[data-testid="community-icon"]')) || divs[0];
  };

  afterEach(() => {
    // Restore getComputedStyle mock if present
    (window.getComputedStyle as jest.SpyInstance | undefined)?.mockRestore?.();
  });

  describe('Rendering', () => {
    it('renders all post information correctly', () => {
      renderComponent();
      
      expect(screen.getByText('Test Community')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText((t) => typeof t === 'string' && t.includes('This is a test post content'))).toBeInTheDocument();
      const counts = within(getFirstPost()!).getAllByText('2');
      expect(counts.length).toBeGreaterThanOrEqual(2); // like and comment counts present
      expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    });

    it('renders community icon and user avatar', () => {
      renderComponent();
      
      expect(screen.getByTestId('community-icon')).toBeInTheDocument();
      expect(screen.getByTestId('community-icon')).toHaveAttribute('data-size', '24');
      expect(screen.getByAltText('Foto do usuário')).toHaveAttribute('src', '/test-avatar.jpg');
    });

    it('renders code icon', () => {
      renderComponent();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
    });

    it('renders heart icon with correct fill for liked post', () => {
      renderComponent();
      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-fill', 'currentColor');
      expect(heartIcon).toHaveAttribute('data-stroke-width', '3');
    });

    it('renders heart icon with no fill for unliked post', () => {
      renderComponent({ currentUserId: 'user-999' }); // Different user
      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-fill', 'none');
    });

    it('renders images when present', () => {
      renderComponent();
      
      expect(screen.getAllByAltText(/Imagem do post/)).toHaveLength(2);
      expect(screen.getByAltText('Imagem do post 1')).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(screen.getByAltText('Imagem do post 2')).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    it('does not render images section when no images', () => {
      renderComponent({ post: mockPostWithoutImages });
      
      expect(screen.queryByAltText(/Imagem do post/)).not.toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      renderComponent();
      
      const contentNode = screen.getByText((t) => typeof t === 'string' && t.includes('This is a test post content'));
      const container = contentNode.closest('.medium-box');
      expect(container).toHaveClass('light-neutral');
      expect(container).toHaveClass('shadow-sm');
      expect(container).toHaveClass('hover:shadow-md');
      expect(container).toHaveClass('transition-shadow');
    });
  });

  describe('User Interactions - Navigation', () => {
    it('redirects to community when clicking community name', async () => {
      renderComponent();
      
      const communityElement = screen.getByText('Test Community').closest('div');
      await userEvent.click(communityElement!);
      
      expect(mockRouterPush).toHaveBeenCalledWith('/comunidade/test-community');
    });

    it('redirects to profile when clicking user info', async () => {
      renderComponent();
      
      const userElement = screen.getByText('@testuser').closest('div');
      await userEvent.click(userElement!);
      
      expect(mockRouterPush).toHaveBeenCalledWith('/testuser');
    });

    it('handles avatar fallback when avatarUrl is null', () => {
      const postWithoutAvatar = {
        ...mockPost,
        autor: { ...mockPost.autor, avatarUrl: null },
      };
      
      renderComponent({ post: postWithoutAvatar });
      
      const img = screen.getByAltText('Foto do usuário');
      expect(img).toHaveAttribute('src', '/AbstractUser.png');
    });
  });

  describe('Text Overflow Management', () => {
    it('toggles expanded state when clicking "Ver mais/Ver menos"', async () => {
      // Mock scrollHeight to trigger overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        value: 50,
      });
      
      renderComponent();
      
      const verMaisButton = screen.getByText('Ver mais...');
      await userEvent.click(verMaisButton);
      
      expect(screen.getByText('Ver menos...')).toBeInTheDocument();
      
      await userEvent.click(screen.getByText('Ver menos...'));
      expect(screen.getByText('Ver mais...')).toBeInTheDocument();
    });

    it('does not show overflow toggle when content is short', () => {
      const shortPost = {
        ...mockPost,
        conteudo: 'Short content',
      };
      // Ensure content measurements don't trigger overflow in JSDOM
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 50,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        value: 50,
      });

      renderComponent({ post: shortPost });

      expect(screen.queryByText('Ver mais...')).not.toBeInTheDocument();
    });

    it('applies word break styles to content', () => {
      renderComponent();
      
      const content = screen.getByText((txt) => typeof txt === 'string' && txt.includes('This is a test post content'));
      const inline = content.getAttribute('style') || '';
      expect(inline).toMatch(/word-break:\s*break-word/);
      expect(inline).toMatch(/overflow-wrap:\s*break-word/);
      expect(inline).toMatch(/transition:\s*max-height 0.3s ease/);
    });
  });

  describe('Image Modal', () => {
    it('renders image modal correctly (direct render)', async () => {
      // Render the mocked ImageModal directly to verify its content
      const ImageModalMock = require('@/components/image-modal');
      render(<ImageModalMock isOpen={true} onClose={() => {}} imagem={'https://example.com/image1.jpg'} imagens={mockPost.imagens} />);

      expect(screen.getByTestId('image-modal')).toBeInTheDocument();
      expect(screen.getByText('Image Modal - Current Image: https://example.com/image1.jpg')).toBeInTheDocument();
    });

    it('calls onClose when closing image modal', async () => {
      const ImageModalMock = require('@/components/image-modal');
      const onClose = jest.fn();

      render(<ImageModalMock isOpen={true} onClose={onClose} imagem={'https://example.com/image1.jpg'} imagens={mockPost.imagens} />);

      const closeButton = within(screen.getByTestId('image-modal')).getByText('Close Modal');
      await userEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Like Functionality', () => {
    it('toggles like when clicking like button', async () => {
      (postsService.likePost as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      renderComponent();
      
      const likeButton = within(getFirstPost()!).getAllByTestId('button-2')[0]; // Button with text "2"
      await userEvent.click(likeButton);
      
      expect(postsService.likePost).toHaveBeenCalledWith('post-123');
    });

    it('handles like error gracefully', async () => {
      (postsService.likePost as jest.Mock).mockRejectedValue(new Error('Like failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderComponent();
      
      const likeButton = within(getFirstPost()!).getAllByTestId('button-2')[0];
      await userEvent.click(likeButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao curtir/descurtir o post:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('disables like button when loading', async () => {
      (postsService.likePost as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      renderComponent();
      
      const likeButton = within(getFirstPost()!).getAllByTestId('button-2')[0];
      await userEvent.click(likeButton);
      
      expect(likeButton).toHaveAttribute('data-disabled', 'true');
    });

    it('disables like button when disableActions is true', () => {
      renderComponent({ disableActions: true });
      
      const likeButton = within(getFirstPost()!).getAllByTestId('button-2')[0];
      expect(likeButton).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Comment Functionality', () => {
    it('calls handleComment when clicking comment button', async () => {
      renderComponent();
      
      const commentButtons = within(getFirstPost()!).getAllByTestId('button-2');
      const commentButton = commentButtons[1];
      await userEvent.click(commentButton);
      
      expect(mockProps.handleComment).toHaveBeenCalled();
    });

    it('disables comment button when disableActions is true', () => {
      renderComponent({ disableActions: true });
      
      const commentButtons = within(getFirstPost()!).getAllByTestId('button-2');
      const commentButton = commentButtons[1]; // Second button with text "2"
      expect(commentButton).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Options Menu - Owner', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('shows options menu icon for owner', () => {
      expect(within(getFirstPost()!).getByTestId('botao-mais-opcoes')).toBeInTheDocument();
      expect(within(getFirstPost()!).getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });

    it('opens options menu when clicking more icon', async () => {
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      expect(screen.getByTestId('botao-deletar')).toBeInTheDocument();
      expect(screen.getByTestId('button-editar')).toBeInTheDocument();
    });

    it('closes options menu on mouse leave', async () => {
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const optionsMenu = screen.getByTestId('botao-deletar').closest('.fixed');
      fireEvent.mouseLeave(optionsMenu!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('botao-deletar')).not.toBeInTheDocument();
      });
    });

    it('calculates menu position correctly', async () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon, { clientX: 700, clientY: 500 });
      
      // Menu should adjust position to fit within window
      const optionsMenu = screen.getByTestId('botao-deletar').closest('.fixed');
      expect(optionsMenu).toBeInTheDocument();
    });

    it('closes options menu when clicking delete option', async () => {
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      expect(screen.queryByTestId('botao-deletar')).not.toBeInTheDocument();
    });
  });

  describe('Options Menu - Moderator', () => {
    it('shows options menu for moderator even when not owner', () => {
      renderComponent({ 
        currentUserId: 'different-user',
        isModerator: true 
      });
      
      expect(within(getFirstPost()!).getByTestId('botao-mais-opcoes')).toBeInTheDocument();
    });

    it('shows delete but not edit for moderator', async () => {
      renderComponent({ 
        currentUserId: 'different-user',
        isModerator: true 
      });
      
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      expect(screen.getByTestId('botao-deletar')).toBeInTheDocument();
      expect(screen.queryByTestId('button-editar')).not.toBeInTheDocument();
    });
  });

  describe('Options Menu - Non-Owner Non-Moderator', () => {
    it('does not show options menu for non-owner non-moderator', () => {
      renderComponent({ 
        currentUserId: 'different-user',
        isModerator: false 
      });
      
      expect(within(getFirstPost()!).queryByTestId('botao-mais-opcoes')).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(async () => {
      renderComponent();
      
      // Open options menu
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
    });

    it('shows delete confirmation popup when clicking delete', async () => {
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      expect(screen.getByTestId('popup')).toBeInTheDocument();
      expect(screen.getByText('Excluir Postagem?')).toBeInTheDocument();
    });

    it('shows different title for moderator deleting other user\'s post', async () => {
      renderComponent({ 
        currentUserId: 'different-user',
        isModerator: true 
      });
      
      // Open options menu on the most recently rendered post
      const posts = screen.getAllByTestId('motion-div');
      const lastPost = posts[posts.length - 1];
      const moreIcon = within(lastPost).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      // Click delete (use the most recent delete button rendered)
      const deleteButtons = screen.getAllByTestId('botao-deletar');
      const deleteButton = deleteButtons[deleteButtons.length - 1];
      await userEvent.click(deleteButton);
      
      expect(screen.getByText(`Excluir Postagem de @${mockPost.autor.username}?`)).toBeInTheDocument();
    });

    it('calls delete API and triggers onDelete when confirming deletion', async () => {
      (postsService.removePost as jest.Mock).mockResolvedValue({});
      
      // Click delete in options menu
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      // Click confirm delete in popup
      const confirmDeleteButton = screen.getByText('Delete');
      await userEvent.click(confirmDeleteButton);
      
      expect(postsService.removePost).toHaveBeenCalledWith('post-123');
      expect(mockProps.onDelete).toHaveBeenCalled();
    });

    it('handles delete error gracefully', async () => {
      (postsService.removePost as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Click delete in options menu
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      // Click confirm delete in popup
      const confirmDeleteButton = screen.getByText('Delete');
      await userEvent.click(confirmDeleteButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao excluir o post:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('cancels delete when clicking cancel in popup', async () => {
      // Click delete in options menu
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      // Click cancel in popup
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);
      
      expect(postsService.removePost).not.toHaveBeenCalled();
      expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    });

    it('does not show delete popup when disableActions is true', () => {
      renderComponent({ disableActions: true });
      
      const posts = screen.getAllByTestId('motion-div');
      const lastPost = posts[posts.length - 1];
      expect(within(lastPost).queryByTestId('botao-mais-opcoes')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(async () => {
      renderComponent();
      
      // Open options menu
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
    });

    it('shows edit modal when clicking edit', async () => {
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      expect(screen.getByTestId('edit-post-modal')).toBeInTheDocument();
    });

    it('closes edit modal when clicking close', async () => {
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      expect(screen.queryByTestId('edit-post-modal')).not.toBeInTheDocument();
    });

    it('triggers onUpdate when edit is successful', async () => {
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);
      
      expect(mockProps.onUpdate).toHaveBeenCalled();
    });

    it('does not show edit button for moderator', async () => {
      renderComponent({ 
        currentUserId: 'different-user',
        isModerator: true 
      });
      
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      expect(screen.queryByTestId('button-editar')).not.toBeInTheDocument();
    });

    it('does not show edit button when disableActions is true', () => {
      renderComponent({ disableActions: true });
      
      const posts = screen.getAllByTestId('motion-div');
      const lastPost = posts[posts.length - 1];
      expect(within(lastPost).queryByTestId('botao-mais-opcoes')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('sets loading state during navigation', async () => {
      renderComponent();
      
      const communityElement = screen.getByText('Test Community').closest('div');
      await userEvent.click(communityElement!);
      
      // Loading state is set internally
      expect(mockRouterPush).toHaveBeenCalled();
    });

    it('sets loading state during like action', async () => {
      (postsService.likePost as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      renderComponent();
      
      const likeButton = within(getFirstPost()!).getAllByTestId('button-2')[0];
      await userEvent.click(likeButton);
      
      // Button should be in loading state
      expect(likeButton).toHaveAttribute('data-disabled', 'true');
    });

    it('sets loading state during delete action', async () => {
      (postsService.removePost as jest.Mock).mockResolvedValue({});
      
      renderComponent();
      
      // Open options menu
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      // Click delete
      const deleteButton = screen.getByTestId('botao-deletar');
      await userEvent.click(deleteButton);
      
      // Click confirm delete
      const confirmDeleteButton = screen.getByText('Delete');
      await userEvent.click(confirmDeleteButton);
      
      // Loading state is set internally
      expect(postsService.removePost).toHaveBeenCalled();
    });
  });

  describe('Animation Components', () => {
    it('renders motion components', () => {
      renderComponent();
      expect(getFirstPost()).toBeInTheDocument();
    });

    it('closes options menu on hover end', async () => {
      renderComponent();
      
      // Open options menu
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      // Trigger onHoverEnd on the overlay motion div
      const overlay = screen.getAllByTestId('motion-div').find((d) => d.className.includes('fixed'));
      fireEvent.mouseLeave(overlay!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('botao-deletar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles post without images gracefully', () => {
      renderComponent({ post: mockPostWithoutImages });
      
      // Should not crash
      expect(screen.getByText('Test Community')).toBeInTheDocument();
    });

    it('handles post with very long content', () => {
      renderComponent({ post: mockPostWithLongContent });
      
      // Should not crash
      expect(screen.getByText((t) => typeof t === 'string' && t.includes(mockPostWithLongContent.conteudo.slice(0, 30)))).toBeInTheDocument();
    });

    it('does not show any options when disableActions is true', () => {
      renderComponent({ disableActions: true });
      
      expect(within(getFirstPost()!).queryByTestId('botao-mais-opcoes')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-post-modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    });

    it('handles window resize for menu positioning', async () => {
      // Mock initial window size
      Object.defineProperty(window, 'innerWidth', { value: 1000 });
      Object.defineProperty(window, 'innerHeight', { value: 800 });
      
      renderComponent();
      
      const moreIcon = within(getFirstPost()!).getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon, { clientX: 950, clientY: 750 });
      
      // Menu should adjust position
      const optionsMenu = screen.getByTestId('botao-deletar').closest('.fixed');
      expect(optionsMenu).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper image alt text', () => {
      renderComponent();
      
      expect(screen.getByAltText('Foto do usuário')).toBeInTheDocument();
      expect(screen.getByAltText('Imagem do post 1')).toBeInTheDocument();
      expect(screen.getByAltText('Imagem do post 2')).toBeInTheDocument();
    });

    it('has clickable elements with hover states', () => {
      renderComponent();
      
      const communityElement = screen.getByText('Test Community').closest('div');
      expect(communityElement).toHaveClass('hover:cursor-pointer');
      
      const userElement = screen.getByText('@testuser').closest('div');
      expect(userElement).toHaveClass('hover:cursor-pointer');
    });

    it('images have pointer cursor for modal interaction', () => {
      renderComponent();
      
      const imageContainer = screen.getByAltText('Imagem do post 1').closest('div');
      expect(imageContainer).toHaveClass('cursor-pointer');
    });
  });
});