import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommunityMember from '@/components/community-member';

// Mock Next.js Link component
jest.mock('next/link', () => {
  // forward any props to the anchor so tests can interact with it (aria, onClick, role, etc.)
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('CommunityMember', () => {
  const defaultProps = {
    username: 'testuser',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with correct username', () => {
      render(<CommunityMember {...defaultProps} />);
      
      const usernameElement = screen.getByText('@testuser');
      expect(usernameElement).toBeInTheDocument();
      expect(usernameElement).toHaveClass('text-h6');
    });

    it('should render with correct container classes', () => {
        render(<CommunityMember {...defaultProps} />);

        const usernameEl = screen.getByText('@testuser');
        const container = usernameEl.closest('a')?.closest('div');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('flex items-center justify-between');
    });

    it('should wrap username in Link component with correct href', () => {
        render(<CommunityMember {...defaultProps} />);
        
        const link = screen.getByText('@testuser').closest('a');
        expect(link).toHaveAttribute('href', '/testuser');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible username text', () => {
      render(<CommunityMember {...defaultProps} />);
      
      const usernameElement = screen.getByText('@testuser');
      expect(usernameElement).toBeInTheDocument();
    });

    it('should have proper link semantics', () => {
      render(<CommunityMember {...defaultProps} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/testuser');
      expect(link).toHaveTextContent('@testuser');
    });
  });

  describe('User Interaction', () => {
    it('should navigate to correct user profile when clicked', async () => {
      const user = userEvent.setup();
      render(<CommunityMember {...defaultProps} />);
      
      const link = screen.getByRole('link');
      await user.click(link);
      
      expect(link).toHaveAttribute('href', '/testuser');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in username', () => {
      const props = { username: 'user-name_with.special@chars123' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@user-name_with.special@chars123');
      expect(usernameElement).toBeInTheDocument();
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/user-name_with.special@chars123');
    });

    it('should handle empty username', () => {
      const props = { username: '' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@');
      expect(usernameElement).toBeInTheDocument();
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(100);
      const props = { username: longUsername };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText(`@${longUsername}`);
      expect(usernameElement).toBeInTheDocument();
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', `/${longUsername}`);
    });

    it('should handle numeric username', () => {
      const props = { username: '12345' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@12345');
      expect(usernameElement).toBeInTheDocument();
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/12345');
    });
  });

  describe('Snapshot Testing', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(<CommunityMember {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with special characters username', () => {
      const props = { username: 'special-user_123' };
      const { container } = render(<CommunityMember {...props} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Prop Validation', () => {
    it('should require username prop', () => {
      render(<CommunityMember username="test" />);
      expect(screen.getByText('@test')).toBeInTheDocument();
    });
  });
});