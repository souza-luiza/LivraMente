import React from 'react';
import { render, screen, fireEvent, waitFor, act, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewComponent from '@/components/resenha';
import { resenhasService } from '@/services/resenhas';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

jest.mock('@/services/resenhas', () => ({
  resenhasService: {
    getResenha: jest.fn(),
    removeResenha: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/resenha-modal', () => {
  return jest.fn(({ isOpen, onClose, bookId, resenhaId, onSuccess }) => 
    isOpen ? (
      <div data-testid="resenha-modal">
        <div>Resenha Modal - Book: {bookId}, Resenha: {resenhaId}</div>
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

jest.mock('@/components/icons/CommentIcon', () => {
  return jest.fn(() => <svg data-testid="comment-icon" />);
});

jest.mock('@/components/icons/HeartIcon', () => {
  return jest.fn(() => <svg data-testid="heart-icon" />);
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

jest.mock('@/components/icons/RemoveIcon', () => {
  return jest.fn(() => <svg data-testid="remove-icon" />);
});

jest.mock('@/components/EditCommentModal', () => {
  return jest.fn(() => <div data-testid="edit-comment-modal" />);
});

jest.mock('@/components/image-modal', () => {
  return jest.fn(() => <div data-testid="image-modal" />);
});

jest.mock('@/components/button', () => {
  return jest.fn(({ text, icon, onClick, fullwidth, colorScheme, size }) => (
    <button 
      data-testid={`button-${text.toLowerCase().replace(/\s+/g, '-')}`}
      data-fullwidth={fullwidth}
      data-color={colorScheme}
      data-size={size}
      onClick={onClick}
    >
      {icon && <span data-testid={`icon-${text.toLowerCase().replace(/\s+/g, '-')}`}>{icon}</span>}
      {text}
    </button>
  ));
});

jest.mock('@/lib/time', () => ({
  getTimeAgo: jest.fn(() => '2 hours ago'),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

jest.mock('@mui/material/Rating', () => {
  return jest.fn(({ value, readOnly, precision, size }) => (
    <div data-testid="rating" data-value={value} data-readonly={readOnly} data-precision={precision} data-size={size}>
      Rating: {value}
    </div>
  ));
});

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

describe('ReviewComponent', () => {
  const mockReviewData = {
    _id: 'resenha-123',
    conteudo: 'This is a test review content that is quite long and might overflow. '.repeat(10),
    avaliacao: 4.5,
    spoiler: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    autor: {
      _id: 'user-123',
      username: 'testuser',
      avatarUrl: '/test-avatar.jpg',
    },
  };

  const mockReviewDataWithSpoiler = {
    ...mockReviewData,
    spoiler: true,
  };

  const mockReviewDataEdited = {
    ...mockReviewData,
    updatedAt: '2024-01-01T12:00:00Z',
  };

  const mockProps = {
    bookId: 'book-123',
    resenhaId: 'resenha-123',
    currentUserId: 'user-123',
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  };

  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    // Ensure computed style returns a numeric lineHeight so overflow logic is deterministic in JSDOM
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      getPropertyValue: (prop: string) => {
        if (prop === 'line-height' || prop === 'lineHeight') return '16px';
        return '';
      },
      lineHeight: '16px',
    } as any));
  });
  

  afterEach(() => {
    // Restore any spies (e.g. getComputedStyle) between tests
    (window.getComputedStyle as jest.SpyInstance)?.mockRestore?.();
  });

  const renderComponent = (overrides = {}) => {
    const props = { ...mockProps, ...overrides };
    return render(<ReviewComponent {...props} />);
  };

  describe('Initial Loading State', () => {
    it('calls getResenha with correct ID on mount', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
      
      expect(resenhasService.getResenha).toHaveBeenCalledWith('resenha-123');
    });

    it('handles error when fetching review fails', async () => {
      (resenhasService.getResenha as jest.Mock).mockRejectedValue(new Error('Failed'));
      
      await act(async () => {
        renderComponent();
      });
      
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar resenha.');
    });
  });

  describe('Rendering Review Data', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('renders user information correctly', () => {
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      const imgs = screen.getAllByAltText('Foto do usuário');
      const avatar = imgs.find(i => i.getAttribute('src') === '/test-avatar.jpg') || imgs[0];
      expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
    });

    it('renders rating correctly', () => {
      const rating = screen.getByTestId('rating');
      expect(rating).toHaveAttribute('data-value', '4.5');
      expect(rating).toHaveAttribute('data-readonly', 'true');
      expect(rating).toHaveAttribute('data-precision', '1');
      expect(rating).toHaveAttribute('data-size', 'small');
      
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('renders review content', () => {
      const motion = screen.getAllByTestId('motion-div')[0];
      const p = motion.querySelector('p.text-b2.whitespace-pre-line');
      expect(p).not.toBeNull();
      expect(p!.textContent).toContain('This is a test review content');
    });

    it('renders timestamp', () => {
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('shows "editado" when review was edited', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewDataEdited);
      cleanup();
      await act(async () => {
        renderComponent();
      });
      
      expect(screen.getByText('2 hours ago (editado)')).toBeInTheDocument();
    });
  });

  describe('User Interactions - Non-Owner', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent({ currentUserId: 'different-user' });
      });
    });

    it('does not show options menu for non-owner', () => {
      expect(screen.queryByTestId('more-horizontal-icon')).not.toBeInTheDocument();
    });

    it('redirects to user profile when clicking on user info', async () => {
      const userInfo = screen.getByText('@testuser').closest('div');
      await userEvent.click(userInfo!);
      
      expect(mockRouterPush).toHaveBeenCalledWith('/testuser');
    });

    it('handles image fallback when avatarUrl is null', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue({
        ...mockReviewData,
        autor: { ...mockReviewData.autor, avatarUrl: null },
      });
      
      await act(async () => {
        renderComponent();
      });
      
      const imgs = screen.getAllByAltText('Foto do usuário');
      expect(imgs.some(i => i.getAttribute('src') === '/AbstractUser.png')).toBe(true);
    });
  });

  describe('User Interactions - Owner', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('shows options menu icon for owner', () => {
      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });

    it('opens options menu when clicking more icon', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      expect(screen.getByTestId('button-excluir')).toBeInTheDocument();
      expect(screen.getByTestId('button-editar')).toBeInTheDocument();
    });

    it('closes options menu on mouse leave', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const optionsMenu = screen.getByTestId('button-excluir').closest('.fixed');
      fireEvent.mouseLeave(optionsMenu!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('button-excluir')).not.toBeInTheDocument();
      });
    });

    it('shows delete confirmation popup when clicking delete option', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const deleteButton = screen.getByTestId('button-excluir');
      await userEvent.click(deleteButton);
      
      expect(screen.getByTestId('popup')).toBeInTheDocument();
      expect(screen.getByText('Excluir Comentário?')).toBeInTheDocument();
    });

    it('shows edit modal when clicking edit option', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      expect(screen.getByTestId('resenha-modal')).toBeInTheDocument();
    });
  });

  describe('Text Overflow Management', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('toggles expanded state when clicking "Ver mais/Ver menos"', async () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        value: 50,
      });
      
      await act(async () => {
        renderComponent();
      });
      
      const verMaisButton = screen.getByText('Ver mais...');
      await userEvent.click(verMaisButton);
      
      expect(screen.getByText('Ver menos...')).toBeInTheDocument();
      
      await userEvent.click(screen.getByText('Ver menos...'));
      expect(screen.getByText('Ver mais...')).toBeInTheDocument();
      // restore prototype overrides so other tests aren't affected
      try {
        delete (HTMLElement.prototype as any).scrollHeight;
        delete (HTMLElement.prototype as any).clientHeight;
      } catch (e) {
        // ignore
      }
    });

    it('does not show overflow toggle when content is short', async () => {
      const shortReview = {
        ...mockReviewData,
        conteudo: 'Short review',
      };
      
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(shortReview);
      
      cleanup();
      await act(async () => {
        renderComponent();
      });
      const motion = screen.getAllByTestId('motion-div')[0];
      expect(within(motion).queryByText('Ver mais...')).not.toBeInTheDocument();
    });
  });

  describe('Spoiler Handling', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewDataWithSpoiler);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('shows spoiler warning when review contains spoilers', () => {
      expect(screen.getByText('Cuidado! Essa resenha contém spoilers.')).toBeInTheDocument();
    });

    it('reveals content when clicking spoiler warning', async () => {
      const spoilerWarning = screen.getByText('Cuidado! Essa resenha contém spoilers.');
      await userEvent.click(spoilerWarning);
      
      expect(screen.queryByText('Cuidado! Essa resenha contém spoilers.')).not.toBeInTheDocument();
    });

    it('does not show spoiler warning when spoiler is false', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      cleanup();
      await act(async () => {
        renderComponent();
      });
      const motion = screen.getAllByTestId('motion-div')[0];
      expect(within(motion).queryByText('Cuidado! Essa resenha contém spoilers.')).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('calls delete API and triggers onDelete when confirming deletion', async () => {
      (resenhasService.removeResenha as jest.Mock).mockResolvedValue({});
      
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const deleteButton = screen.getByTestId('button-excluir');
      await userEvent.click(deleteButton);
      
      const confirmDeleteButton = screen.getByText('Delete');
      await userEvent.click(confirmDeleteButton);
      
      expect(resenhasService.removeResenha).toHaveBeenCalledWith('resenha-123');
      expect(mockProps.onDelete).toHaveBeenCalled();
    });

    it('handles delete error gracefully', async () => {
      (resenhasService.removeResenha as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const deleteButton = screen.getByTestId('button-excluir');
      await userEvent.click(deleteButton);
      
      const confirmDeleteButton = screen.getByText('Delete');
      await userEvent.click(confirmDeleteButton);
      
      expect(toast.error).toHaveBeenCalledWith('Erro ao excluir resenha.');
      expect(mockProps.onDelete).toHaveBeenCalled();
    });

    it('cancels delete when clicking cancel in popup', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const deleteButton = screen.getByTestId('button-excluir');
      await userEvent.click(deleteButton);
      
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);
      
      expect(resenhasService.removeResenha).not.toHaveBeenCalled();
      expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('opens edit modal and refreshes data on success', async () => {
      const updatedReview = { ...mockReviewData, conteudo: 'Updated content' };
      (resenhasService.getResenha as jest.Mock)
        .mockResolvedValueOnce(mockReviewData)
        .mockResolvedValueOnce(updatedReview);
      
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);
      
      expect(resenhasService.getResenha).toHaveBeenCalledTimes(2);
      expect(mockProps.onUpdate).toHaveBeenCalled();
    });

    it('handles edit error gracefully', async () => {
      // ensure a clean render so we control the sequence of mocked calls
      cleanup();
      (resenhasService.getResenha as jest.Mock)
        .mockResolvedValueOnce(mockReviewData)
        .mockRejectedValueOnce(new Error('Update failed'));
      await act(async () => {
        renderComponent();
      });

      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);

      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar resenha.');
      expect(mockProps.onUpdate).toHaveBeenCalled();
    });

    it('closes edit modal when clicking close', async () => {
      const moreIcon = screen.getByTestId('more-horizontal-icon');
      await userEvent.click(moreIcon);
      
      const editButton = screen.getByTestId('button-editar');
      await userEvent.click(editButton);
      
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      expect(screen.queryByTestId('resenha-modal')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {

    it('handles missing username in autor', async () => {
      const reviewWithPartialAutor = {
        ...mockReviewData,
        autor: { _id: 'user-123' },
      };
      
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(reviewWithPartialAutor);
      
      await act(async () => {
        renderComponent();
      });
      
      const imgs = screen.getAllByAltText('Foto do usuário');
      const userInfo = imgs[0].closest('div');
      await userEvent.click(userInfo!);
      
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('handles very long content without breaking layout', async () => {
      const veryLongReview = {
        ...mockReviewData,
        conteudo: 'A'.repeat(1000),
      };
      
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(veryLongReview);
      
      await act(async () => {
        renderComponent();
      });
      
      const motion = screen.getAllByTestId('motion-div')[0];
      const p = motion.querySelector('p.text-b2.whitespace-pre-line');
      expect(p).not.toBeNull();
      expect(p!.textContent).toContain(veryLongReview.conteudo.slice(0, 20));
    });

    it('does not show edit modal for non-owner', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent({ currentUserId: 'different-user' });
      });
      
      expect(screen.queryByTestId('resenha-modal')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    beforeEach(async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
    });

    it('applies correct CSS classes to container', () => {
      const motion = screen.getAllByTestId('motion-div')[0];
      const container = motion.querySelector('.medium-box');
      expect(container).not.toBeNull();
      expect(container).toHaveClass('light-neutral');
      expect(container).toHaveClass('shadow-sm');
      expect(container).toHaveClass('hover:shadow-md');
    });

    it('applies correct text classes', () => {
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-h6');
      
      const timestamp = screen.getByText('2 hours ago');
      expect(timestamp).toHaveClass('text-b3');
      expect(timestamp).toHaveClass('body-semibold');
    });

    it('applies word break styles to content', () => {
      const motion = screen.getAllByTestId('motion-div')[0];
      const content = motion.querySelector('p.text-b2.whitespace-pre-line');
      expect(content).not.toBeNull();
      const styleAttr = (content as HTMLElement).getAttribute('style') || '';
      expect(styleAttr).toContain('word-break: break-word');
      expect(styleAttr).toContain('overflow-wrap: break-word');
    });
  });

  describe('Animation and Transition', () => {
    it('renders motion components', async () => {
      (resenhasService.getResenha as jest.Mock).mockResolvedValue(mockReviewData);
      
      await act(async () => {
        renderComponent();
      });
      
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });
  });
});