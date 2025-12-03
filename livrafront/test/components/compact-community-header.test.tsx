import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import CompactCommunityHeader from '@/components/compact-community-header';
import Button from '@/components/button';
import { Comunidade } from '@/types/comunidade';
import { titleToSlug } from '@/lib/slugify';

jest.mock('@/components/button', () => {
  return jest.fn(({ text, icon, onClick, path, colorScheme, size }) => (
    <button 
      data-testid={`button-${text.toLowerCase().replace(/\s+/g, '-')}`}
      data-color={colorScheme}
      data-size={size}
      onClick={onClick}
      data-path={path}
    >
      {icon && <span data-testid={`icon-${text.toLowerCase().replace(/\s+/g, '-')}`}>{icon}</span>}
      {text}
    </button>
  ));
});

jest.mock('@/components/icons/CommunityIcon', () => {
  return jest.fn(({ size }) => (
    <svg data-testid="community-icon" data-size={size} />
  ));
});

jest.mock('@/components/icons/PenToolIcon', () => {
  return jest.fn(() => <svg data-testid="pen-tool-icon" />);
});

jest.mock('@/components/icons/EditIcon', () => {
  return jest.fn(() => <svg data-testid="edit-icon" />);
});

jest.mock('@/components/icons/Edit2Icon', () => {
  return jest.fn(() => <svg data-testid="edit2-icon" />);
});

jest.mock('@/components/icons/AddIcon', () => {
  return jest.fn(() => <svg data-testid="add-icon" />);
});

jest.mock('@/components/icons/OpenBookIcon', () => {
  return jest.fn(() => <svg data-testid="open-book-icon" />);
});

jest.mock('@/lib/slugify', () => ({
  titleToSlug: jest.fn((title) => title.toLowerCase().replace(/\s+/g, '-'))
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('CompactCommunityHeader', () => {
  const mockCommunity: Comunidade = {
    _id: '1',
    nome: 'Test Community',
    descricao: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capaUrl: undefined,
    bannerUrl: undefined,
    moderadores: [],
    membros: [],
    posts: [],
  };

  const mockOnToggleMembership = jest.fn();
  const mockOnOpenPostModal = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush
    });
  });

  const renderComponent = (overrides = {}) => {
    const defaultProps = {
      community: mockCommunity,
      isMember: false,
      isModerator: false,
      onToggleMembership: mockOnToggleMembership,
      onOpenPostModal: mockOnOpenPostModal,
      ...overrides
    };

    return render(<CompactCommunityHeader {...defaultProps} />);
  };

  describe('Rendering', () => {
    it('renders the component with community name', () => {
      renderComponent();
      
      expect(screen.getByText('Test Community')).toBeInTheDocument();
      expect(screen.getByTestId('community-icon')).toBeInTheDocument();
    });

    it('applies correct CSS classes and styles', () => {
      const { container } = renderComponent();
      
      const headerDiv = container.firstChild as HTMLElement;
      expect(headerDiv).toHaveClass(
        'fixed top-16 z-40 light-green flex flex-row small-border-radius shadow-lg gap-4'
      );
    });

    it('renders Entrar button when user is not a member', () => {
      renderComponent({ isMember: false });
      
      expect(screen.getByTestId('button-entrar')).toBeInTheDocument();
      expect(screen.getByTestId('icon-entrar')).toBeInTheDocument();
      expect(screen.queryByTestId('button-postar')).not.toBeInTheDocument();
    });

    it('renders Postar button when user is a member', () => {
      renderComponent({ isMember: true });
      
      expect(screen.getByTestId('button-postar')).toBeInTheDocument();
      expect(screen.getByTestId('icon-postar')).toBeInTheDocument();
      expect(screen.queryByTestId('button-entrar')).not.toBeInTheDocument();
    });

    it('renders Criar História button always', () => {
      renderComponent();
      
      expect(screen.getByTestId('button-criar-história')).toBeInTheDocument();
      expect(screen.getByTestId('icon-criar-história')).toBeInTheDocument();
    });

    it('renders Wiki button always', () => {
      renderComponent();
      
      expect(screen.getByTestId('button-wiki')).toBeInTheDocument();
      expect(screen.getByTestId('icon-wiki')).toBeInTheDocument();
    });

    it('renders Editar button only when user is moderator', () => {
      const { rerender } = renderComponent({ isModerator: false });
      
      expect(screen.queryByTestId('button-editar')).not.toBeInTheDocument();
      
      rerender(
        <CompactCommunityHeader
          community={mockCommunity}
          isMember={false}
          isModerator={true}
          onToggleMembership={mockOnToggleMembership}
          onOpenPostModal={mockOnOpenPostModal}
        />
      );
      
      expect(screen.getByTestId('button-editar')).toBeInTheDocument();
      expect(screen.getByTestId('icon-editar')).toBeInTheDocument();
    });

    it('calls titleToSlug with community name', () => {
      renderComponent();
      
      expect(titleToSlug).toHaveBeenCalledWith('Test Community');
    });
  });

  describe('Interactions', () => {
    it('calls onToggleMembership when Entrar button is clicked', async () => {
      renderComponent({ isMember: false });
      
      const entrarButton = screen.getByTestId('button-entrar');
      await userEvent.click(entrarButton);
      
      expect(mockOnToggleMembership).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenPostModal when Postar button is clicked', async () => {
      renderComponent({ isMember: true });
      
      const postarButton = screen.getByTestId('button-postar');
      await userEvent.click(postarButton);
      
      expect(mockOnOpenPostModal).toHaveBeenCalledTimes(1);
    });

    it('scrolls to top when community name is clicked', () => {
      const scrollToMock = jest.fn();
      window.scrollTo = scrollToMock;
      
      renderComponent();
      
      const communityButton = screen.getByRole('button', { name: /Test Community/ });
      fireEvent.click(communityButton);
      
      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    });

    it('applies hover cursor style to community name button', () => {
      renderComponent();
      
      const communityButton = screen.getByRole('button', { name: /Test Community/ });
      expect(communityButton).toHaveClass('hover:cursor-pointer');
    });
  });

  describe('Navigation', () => {
    it('generates correct slug for community edit path', () => {
      renderComponent({ isModerator: true });
      
      expect(titleToSlug).toHaveReturnedWith('test-community');
      
      const editButton = screen.getByTestId('button-editar');
      expect(editButton).toHaveAttribute('data-path', '/comunidade/test-community/editar');
    });

    it('generates correct path for Wiki button', () => {
      renderComponent();
      
      const wikiButton = screen.getByTestId('button-wiki');
      expect(wikiButton).toHaveAttribute('data-path', '/wiki/Test Community');
    });

    it('generates correct path for Criar História button', () => {
      renderComponent();
      
      const criarHistoriaButton = screen.getByTestId('button-criar-história');
      expect(criarHistoriaButton).toHaveAttribute('data-path', '/criar-historia');
    });
  });

  describe('Edge Cases', () => {
    it('handles community name with special characters', () => {
      const communityWithSpecialChars: Comunidade = {
        ...mockCommunity,
        nome: 'Test & Community @ 2024'
      };
      
      renderComponent({ community: communityWithSpecialChars });
      
      expect(titleToSlug).toHaveBeenCalledWith('Test & Community @ 2024');
      expect(screen.getByText('Test & Community @ 2024')).toBeInTheDocument();
    });

    it('handles empty community name', () => {
      const communityWithEmptyName: Comunidade = {
        ...mockCommunity,
        nome: ''
      };
      
      renderComponent({ community: communityWithEmptyName });
      
      expect(titleToSlug).toHaveBeenCalledWith('');
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    it('handles long community name', () => {
      const longName = 'A'.repeat(100);
      const communityWithLongName: Comunidade = {
        ...mockCommunity,
        nome: longName
      };
      
      renderComponent({ community: communityWithLongName });
      
      expect(titleToSlug).toHaveBeenCalledWith(longName);
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('renders correctly when user is both member and moderator', () => {
      renderComponent({ isMember: true, isModerator: true });
      
      expect(screen.getByTestId('button-postar')).toBeInTheDocument();
      expect(screen.getByTestId('button-editar')).toBeInTheDocument();
      expect(screen.queryByTestId('button-entrar')).not.toBeInTheDocument();
    });

    it('renders correctly when community has minimal properties', () => {
        const minimalCommunity: Comunidade = {
            _id: 'min-1',
            nome: 'Minimal',
            descricao: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            capaUrl: undefined,
            bannerUrl: undefined,
            moderadores: [],
            membros: [],
            posts: [],
        };
      
      renderComponent({ community: minimalCommunity });
      
      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByTestId('button-entrar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = renderComponent();
      
      const header = container.firstChild;
      expect(header).toBeInTheDocument();
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-h6');
      expect(heading).toHaveTextContent('Test Community');
    });

    it('community button is focusable and clickable', async () => {
      renderComponent();
      
      const communityButton = screen.getByRole('button', { name: /Test Community/ });
      
      await userEvent.tab();
      expect(communityButton).toHaveFocus();
      
      await userEvent.click(communityButton);
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Icon Components', () => {
    it('passes correct size to CommunityIcon', () => {
      renderComponent();
      
      const communityIcon = screen.getByTestId('community-icon');
      expect(communityIcon).toHaveAttribute('data-size', '24');
    });

    it('renders all icon components with correct test ids', () => {
      renderComponent({ isModerator: true });
      
      expect(screen.getByTestId('community-icon')).toBeInTheDocument();
      expect(screen.getByTestId('pen-tool-icon')).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('open-book-icon')).toBeInTheDocument();
    });
  });
});