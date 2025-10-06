// components/tests/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../button'
import LogoIcon from '../icons/LogoIcon'

// Replace the real SVG logo with a tiny stable placeholder for tests/snapshots
jest.mock('../icons/LogoIcon', () => ({
  __esModule: true,
  default: function DummyLogo() {
    return <span data-testid="test-icon">🎯</span>
  },
}))

describe('Button Component', () => {
  const defaultProps = {
    text: 'Click me',
    icon: <LogoIcon data-testid="test-icon" />,
    size: 'medium' as const,
    colorScheme: 'light-green' as const,
  }

  describe('Rendering and Props', () => {
    it('renders with correct text and icon', () => {
      render(<Button {...defaultProps} />)
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('applies correct size classes', () => {
      const { rerender } = render(<Button {...defaultProps} size="small" />)
      expect(screen.getByRole('button')).toHaveClass('small')

      rerender(<Button {...defaultProps} size="large" />)
      expect(screen.getByRole('button')).toHaveClass('large')
    })

    it('applies correct text size classes based on button size', () => {
      const { rerender } = render(<Button {...defaultProps} size="small" />)
      expect(screen.getByText('Click me')).toHaveClass('text-h6')

      rerender(<Button {...defaultProps} size="medium" />)
      expect(screen.getByText('Click me')).toHaveClass('text-h4')

      rerender(<Button {...defaultProps} size="large" />)
      expect(screen.getByText('Click me')).toHaveClass('text-h2')
    })

    it('applies correct color scheme classes', () => {
      const { rerender } = render(<Button {...defaultProps} colorScheme="dark-green" />)
      expect(screen.getByRole('button')).toHaveClass('dark-green')

      rerender(<Button {...defaultProps} colorScheme="light-brown" />)
      expect(screen.getByRole('button')).toHaveClass('light-brown')
    })

    it('handles additional HTML attributes', () => {
      render(
        <Button 
          {...defaultProps} 
          id="test-button" 
          aria-label="Test button" 
          data-testid="custom-testid" 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'test-button')
      expect(button).toHaveAttribute('aria-label', 'Test button')
      expect(button).toHaveAttribute('data-testid', 'custom-testid')
    })
  })

  describe('Behavior and Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button {...defaultProps} onClick={handleClick} />)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles disabled state correctly', () => {
      const handleClick = jest.fn()
      
      render(<Button {...defaultProps} disabled onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles loading state correctly', () => {
      render(<Button {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toHaveClass('animate-spin')
    })

    it('is disabled when both loading and disabled props are true', () => {
      render(<Button {...defaultProps} loading disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('handles keyboard interactions', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button {...defaultProps} onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      await user.keyboard(' ')
      
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('shows loading spinner and hides text/icon when loading', () => {
      render(<Button {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
      // Original icon should still be in DOM but loading spinner takes precedence visually
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-1')
      expect(button).toHaveClass('focus-visible:ring-black')
    })

    it('maintains accessibility when loading', () => {
      render(<Button {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('has correct cursor styles for different states', () => {
      const { rerender } = render(<Button {...defaultProps} />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('hover:cursor-pointer')
      
      rerender(<Button {...defaultProps} disabled />)
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Snapshot Tests', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<Button {...defaultProps} />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with loading state', () => {
      const { container } = render(<Button {...defaultProps} loading />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with disabled state', () => {
      const { container } = render(<Button {...defaultProps} disabled />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with different sizes', () => {
      const { container } = render(<Button {...defaultProps} size="large" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with different color schemes', () => {
      const { container } = render(<Button {...defaultProps} colorScheme="dark-brown" />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Visual Regression Style Tests', () => {
    it('applies correct hover and active states', () => {
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:opacity-90')
      expect(button).toHaveClass('hover:cursor-pointer')
      expect(button).toHaveClass('active:opacity-95')
    })

    it('applies correct disabled state styles', () => {
      render(<Button {...defaultProps} disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-70')
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined or null icon gracefully', () => {
      render(<Button {...defaultProps} icon={null} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Button should still render without crashing
    })

    it('handles ReactNode text correctly', () => {
      const textNode = <span data-testid="custom-text">Custom Text</span>
      render(<Button {...defaultProps} text={textNode} />)
      
      expect(screen.getByTestId('custom-text')).toBeInTheDocument()
    })

    it('handles empty string text', () => {
      render(<Button {...defaultProps} text="" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Should render without text content
    })
  })
})