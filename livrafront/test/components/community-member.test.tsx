import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import CommunityMember from '@/components/community-member';

// Mock Next.js Link component
jest.mock('next/link', () => {
  // forward any props to the anchor so tests can interact with it (aria, onClick, role, etc.)
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Next.js navigation (useRouter)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CommunityMember', () => {
  const defaultProps = {
    userId: 'user-1',
    username: 'testuser',
  };

  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

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
      const innerDiv = usernameEl.closest('div');
      expect(innerDiv).toBeInTheDocument();
      expect(innerDiv).toHaveClass('w-full');
      expect(innerDiv).toHaveClass('flex');
      expect(innerDiv).toHaveClass('items-center');
    });

    it('should wrap username in Link component with correct href', () => {
        render(<CommunityMember {...defaultProps} />);
      const innerDiv = screen.getByText('@testuser').closest('div');
      expect(innerDiv).toBeInTheDocument();
      // clicking the element should navigate to the user's profile
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith('/testuser');
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
      const usernameElement = screen.getByText('@testuser');
      expect(usernameElement).toBeInTheDocument();
      // element should be interactive (click triggers router.push)
      const innerDiv = usernameElement.closest('div');
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith('/testuser');
    });
  });

  describe('User Interaction', () => {
    it('should navigate to correct user profile when clicked', async () => {
      const user = userEvent.setup();
      render(<CommunityMember {...defaultProps} />);
      
      const innerDiv = screen.getByText('@testuser').closest('div');
      await user.click(innerDiv as Element);
      expect(mockPush).toHaveBeenCalledWith('/testuser');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in username', () => {
      const props = { userId: 'user-1', username: 'user-name_with.special@chars123' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@user-name_with.special@chars123');
      expect(usernameElement).toBeInTheDocument();
      const innerDiv = usernameElement.closest('div');
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith('/user-name_with.special@chars123');
    });

    it('should handle empty username', () => {
      const props = { userId: 'user-1', username: '' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@');
      expect(usernameElement).toBeInTheDocument();
      const innerDiv = usernameElement.closest('div');
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(100);
      const props = { userId: 'user-1', username: longUsername };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText(`@${longUsername}`);
      expect(usernameElement).toBeInTheDocument();
      const innerDiv = usernameElement.closest('div');
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith(`/${longUsername}`);
    });

    it('should handle numeric username', () => {
      const props = { userId: 'user-1', username: '12345' };
      render(<CommunityMember {...props} />);
      
      const usernameElement = screen.getByText('@12345');
      expect(usernameElement).toBeInTheDocument();
      const innerDiv = usernameElement.closest('div');
      innerDiv && innerDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockPush).toHaveBeenCalledWith('/12345');
    });
  });

  describe('Snapshot Testing', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(<CommunityMember {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    it('should match snapshot with special characters username', () => {
      const props = { userId: 'user-1', username: 'special-user_123' };
      const { container } = render(<CommunityMember {...props} />);
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
      expect(screen.getByText('@special-user_123')).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('should require username prop', () => {
      render(<CommunityMember username="test" userId="user-1" />);
      expect(screen.getByText('@test')).toBeInTheDocument();
    });
  });
});