import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PopUp from '@/components/pop-up';
import { useRouter } from 'next/navigation';

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, onClick, ...props }: any) => (
        <div 
          data-testid="motion-div" 
          onClick={onClick}
          {...props}
        >
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
    path 
  }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      data-path={path}
    >
      {text} {icon && 'Icon'}
    </button>
  ),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('PopUp', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockButton1Click = jest.fn();
  const mockButton2Click = jest.fn();
  const mockPush = jest.fn();

  const mockLeftIcon = <div data-testid="left-icon">Left Icon</div>;
  const mockRightIcon = <div data-testid="right-icon">Right Icon</div>;
  const mockButtonIcon = <div data-testid="button-icon">Button Icon</div>;

  const defaultProps = {
    title: 'Test PopUp',
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    });
  });

  describe('Rendering and Visibility', () => {
    it('should return null when isOpen is false', () => {
      const { container } = render(
        <PopUp {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<PopUp {...defaultProps} />);
      
      expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
      expect(screen.getByText('Test PopUp')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<PopUp {...defaultProps} description="Test description" />);
      
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<PopUp {...defaultProps} />);
      
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('should render left icon when provided', () => {
      render(<PopUp {...defaultProps} leftIcon={mockLeftIcon} />);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon when provided', () => {
      render(<PopUp {...defaultProps} rightIcon={mockRightIcon} />);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should render both icons when provided', () => {
      render(<PopUp {...defaultProps} leftIcon={mockLeftIcon} rightIcon={mockRightIcon} />);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should render button1 when provided', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        colorScheme: 'light-green' as const,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toHaveTextContent('Button 1');
    });

    it('should render button2 when provided', () => {
      const button2 = {
        text: 'Button 2',
        icon: mockButtonIcon,
        colorScheme: 'dark-brown' as const,
      };
      
      render(<PopUp {...defaultProps} button2={button2} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toHaveTextContent('Button 2');
    });

    it('should render both buttons when provided', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        colorScheme: 'light-green' as const,
      };
      const button2 = {
        text: 'Button 2',
        icon: mockButtonIcon,
        colorScheme: 'dark-brown' as const,
      };
      
      render(<PopUp {...defaultProps} button1={button1} button2={button2} />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent('Button 1');
      expect(buttons[1]).toHaveTextContent('Button 2');
    });

    it('should not render buttons section when no buttons provided', () => {
      render(<PopUp {...defaultProps} />);
      
      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });
  });

  describe('Initialization Effects', () => {
    it('should disable body scroll when popup opens', () => {
      render(<PopUp {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when popup closes', () => {
      const { unmount } = render(<PopUp {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore original overflow style on unmount', () => {
      document.body.style.overflow = 'auto';
      
      const { unmount } = render(<PopUp {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('auto');
    });

    it('should not modify body scroll when isOpen is false', () => {
      document.body.style.overflow = 'auto';
      
      const { unmount } = render(
        <PopUp {...defaultProps} isOpen={false} />
      );
      
      expect(document.body.style.overflow).toBe('auto');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Click Handlers', () => {
    it('should call onClose when clicking outside popup', () => {
      render(<PopUp {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside popup', () => {
      render(<PopUp {...defaultProps} />);
      
      const popupContent = screen.getByText('Test PopUp').closest('div');
      fireEvent.click(popupContent!);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call button1 onClick when provided', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockButton1Click).toHaveBeenCalled();
    });

    it('should call button2 onClick when provided', () => {
      const button2 = {
        text: 'Button 2',
        icon: mockButtonIcon,
        onClick: mockButton2Click,
      };
      
      render(<PopUp {...defaultProps} button2={button2} />);
      
      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockButton2Click).toHaveBeenCalled();
    });

    it('should not call onClose when clicking buttons', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockButton1Click).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle button without onClick handler', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');

      // Should not throw error when clicked
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should handle button without onClose handler', () => {
      render(<PopUp {...defaultProps} onClose={undefined} />);
      
      const overlay = screen.getByTestId('motion-div');

      // Should not throw error when clicked
      expect(() => fireEvent.click(overlay)).not.toThrow();
    });
  });

  describe('Button Disabled State', () => {
    it('should disable buttons when disableActions is true', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} disableActions={true} />);
      
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('should not disable buttons when disableActions is false', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} disableActions={false} />);
      
      const button = screen.getByTestId('button');
      expect(button).not.toBeDisabled();
    });

    it('should not disable buttons when disableActions is not provided', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).not.toBeDisabled();
    });

    it('should prevent button click when disabled', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} disableActions={true} />);
      
      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockButton1Click).not.toHaveBeenCalled();
    });
  });

  describe('Button Path Navigation', () => {
    it('should pass path prop to button component', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        path: '/test-path',
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('data-path', '/test-path');
    });

    it('should handle button without path', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).not.toHaveAttribute('data-path');
    });
  });

  describe('Color Schemes', () => {
    it('should handle all valid color schemes for button1', () => {
      const colorSchemes = [
        'light-green',
        'dark-green',
        'light-brown',
        'dark-brown',
        'light-neutral',
      ] as const;
      
      colorSchemes.forEach(colorScheme => {
        const button1 = {
          text: `Button ${colorScheme}`,
          icon: mockButtonIcon,
          colorScheme,
        };
        
        const { unmount } = render(
          <PopUp {...defaultProps} button1={button1} />
        );
        
        expect(screen.getByTestId('button')).toBeInTheDocument();
        expect(screen.getByTestId('button')).toHaveTextContent(`Button ${colorScheme}`);
        unmount();
      });
    });

    it('should handle all valid color schemes for button2', () => {
      const colorSchemes = [
        'light-green',
        'dark-green',
        'light-brown',
        'dark-brown',
        'light-neutral',
      ] as const;
      
      colorSchemes.forEach(colorScheme => {
        const button2 = {
          text: `Button ${colorScheme}`,
          icon: mockButtonIcon,
          colorScheme,
        };
        
        const { unmount } = render(
          <PopUp {...defaultProps} button2={button2} />
        );
        
        expect(screen.getByTestId('button')).toBeInTheDocument();
        expect(screen.getByTestId('button')).toHaveTextContent(`Button ${colorScheme}`);
        unmount();
      });
    });

    it('should handle button without colorScheme', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Button Text and Icon', () => {
    it('should handle button without text', () => {
      const button1 = {
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Icon');
    });

    it('should handle button without icon', () => {
      const button1 = {
        text: 'Button 1',
        icon: undefined,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).not.toHaveTextContent('Icon');
    });

    it('should handle button with both text and icon', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Button 1 Icon');
    });
  });

  describe('Layout and Styling', () => {
    it('should have correct modal styling', () => {
      render(<PopUp {...defaultProps} />);
      
      const modalContent = screen.getByTestId('motion-div').querySelector('div');
      expect(modalContent).toHaveClass('bg-gray-50');
      expect(modalContent).toHaveClass('medium-padding');
      expect(modalContent).toHaveClass('medium-border-radius');
      expect(modalContent).toHaveClass('gap-3');
    });

    it('should have correct background overlay', () => {
      render(<PopUp {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      expect(overlay).toHaveStyle('background-color: rgba(0, 0, 0, 0.8)');
    });

    it('should have correct max dimensions', () => {
      render(<PopUp {...defaultProps} />);
      
      const modalContent = screen.getByTestId('motion-div').querySelector('div');
      expect(modalContent).toHaveStyle('max-width: 30%');
      expect(modalContent).toHaveStyle('max-height: 30%');
    });

    it('should have correct text color', () => {
      render(<PopUp {...defaultProps} />);
      
      const modalContent = screen.getByTestId('motion-div').querySelector('div');
      expect(modalContent).toHaveStyle('color: var(--primary-800)');
    });

    it('should have correct header layout', () => {
      render(<PopUp {...defaultProps} leftIcon={mockLeftIcon} rightIcon={mockRightIcon} />);
      
      const header = screen.getByText('Test PopUp').closest('div');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-row');
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('justify-between');
      expect(header).toHaveClass('gap-2');
    });

    it('should center align title', () => {
      render(<PopUp {...defaultProps} />);
      
      const title = screen.getByText('Test PopUp');
      expect(title).toHaveClass('text-center');
    });

    it('should center align description', () => {
      render(<PopUp {...defaultProps} description="Test description" />);
      
      const description = screen.getByText('Test description');
      expect(description).toHaveClass('text-center');
    });

    it('should have correct button container layout', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);
      
      const buttonContainer = screen.getByTestId('button').closest('div');
      expect(buttonContainer).toHaveClass('flex');
      expect(buttonContainer).toHaveClass('flex-row');
      expect(buttonContainer).toHaveClass('items-center');
      expect(buttonContainer).toHaveClass('justify-center');
      expect(buttonContainer).toHaveClass('gap-1');
    });

    it('should have correct z-index', () => {
      render(<PopUp {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      expect(overlay).toHaveClass('z-50');
    });
  });

  describe('Animation Props', () => {
    it('should have correct animation props', () => {
      render(<PopUp {...defaultProps} />);
      
      const overlay = screen.getByTestId('motion-div');
      // our framer-motion mock serializes props to strings; ensure animation props exist
      expect(overlay.getAttribute('initial')).toBeTruthy();
      expect(overlay.getAttribute('animate')).toBeTruthy();
      expect(overlay.getAttribute('exit')).toBeTruthy();
      expect(overlay.getAttribute('transition')).toBeTruthy();
    });

    it('should use AnimatePresence with wait mode', () => {
      render(<PopUp {...defaultProps} />);
      
      const animatePresence = screen.getByTestId('animate-presence');
      expect(animatePresence).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<PopUp {...defaultProps} title="" />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      render(<PopUp {...defaultProps} title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000);
      render(<PopUp {...defaultProps} description={longDescription} />);
      
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'PopUp with spéciäl chãracters & symbols: !@#$%^&*()';
      render(<PopUp {...defaultProps} title={specialTitle} />);
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle special characters in description', () => {
      const specialDescription = 'Description with spéciäl chãracters & symbols: !@#$%^&*()';
      render(<PopUp {...defaultProps} description={specialDescription} />);
      
      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });

    it('should handle missing onSuccess prop', () => {
      render(<PopUp {...defaultProps} />);
      
      // Should render without errors even though onSuccess is not passed
      expect(screen.getByText('Test PopUp')).toBeInTheDocument();
    });

    it('should handle component without any buttons', () => {
      render(<PopUp {...defaultProps} />);
      
      expect(screen.getByText('Test PopUp')).toBeInTheDocument();
      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('should handle component with only one button', () => {
      const button1 = {
        text: 'Single Button',
        icon: mockButtonIcon,
      };
      
      render(<PopUp {...defaultProps} button1={button1} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toHaveTextContent('Single Button');
      expect(screen.queryAllByTestId('button')).toHaveLength(1);
    });
  });

  describe('Component Re-renders', () => {
    it('should update title when prop changes', () => {
      const { rerender } = render(
        <PopUp {...defaultProps} title="Initial Title" />
      );
      
      expect(screen.getByText('Initial Title')).toBeInTheDocument();
      
      rerender(
        <PopUp {...defaultProps} title="Updated Title" />
      );
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.queryByText('Initial Title')).not.toBeInTheDocument();
    });

    it('should show/hide description when prop changes', () => {
      const { rerender } = render(
        <PopUp {...defaultProps} description="Initial Description" />
      );
      
      expect(screen.getByText('Initial Description')).toBeInTheDocument();
      
      rerender(
        <PopUp {...defaultProps} description={undefined} />
      );
      
      expect(screen.queryByText('Initial Description')).not.toBeInTheDocument();
    });

    it('should show/hide buttons when props change', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
      };
      
      const { rerender } = render(
        <PopUp {...defaultProps} button1={button1} />
      );
      
      expect(screen.getByTestId('button')).toBeInTheDocument();

      rerender(
        <PopUp {...defaultProps} button1={undefined} />
      );

      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('should update disableActions state', () => {
      const button1 = {
        text: 'Button 1',
        icon: mockButtonIcon,
        onClick: mockButton1Click,
      };
      
      const { rerender } = render(
        <PopUp {...defaultProps} button1={button1} disableActions={false} />
      );
      
      const button = screen.getByTestId('button');
      expect(button).not.toBeDisabled();
      
      rerender(
        <PopUp {...defaultProps} button1={button1} disableActions={true} />
      );
      
      expect(button).toBeDisabled();
    });
  });
});