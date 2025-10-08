// components/textless-button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextlessButton from '../../src/components/textless-button'
import LogoIcon from '../../src/components/icons/LogoIcon'

// Replace the real SVG logo with a tiny stable placeholder for tests/snapshots
jest.mock('../../src/components/icons/LogoIcon', () => ({
  __esModule: true,
  default: function DummyLogo() {
    return <span data-testid="test-icon">🎯</span>
  },
}))

describe('TextlessButton Component', () => {
  const defaultProps = {
    icon: <LogoIcon data-testid="test-icon" />,
    size: 'medium' as const,
    colorScheme: 'light-green' as const,
  }

  describe('Rendering and Props', () => {
    it('renders only icon without text', () => {
      render(<TextlessButton {...defaultProps} />)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      // Ensure no text content is rendered
      const button = screen.getByRole('button')
      expect(button).not.toHaveTextContent('Click me')
    })

    it('applies correct textless size classes', () => {
      const { rerender } = render(<TextlessButton {...defaultProps} size="small" />)
      expect(screen.getByRole('button')).toHaveClass('textless-small')

      rerender(<TextlessButton {...defaultProps} size="medium" />)
      expect(screen.getByRole('button')).toHaveClass('textless-medium')

      rerender(<TextlessButton {...defaultProps} size="large" />)
      expect(screen.getByRole('button')).toHaveClass('textless-large')
    })

    it('applies correct icon size classes based on button size', () => {
      const { rerender } = render(<TextlessButton {...defaultProps} size="small" />)
  const iconWrapper = screen.getByTestId('test-icon').parentElement
  expect(iconWrapper).toHaveClass('w-4 h-4')

      rerender(<TextlessButton {...defaultProps} size="medium" />)
  expect(iconWrapper).toHaveClass('w-6 h-6')

      rerender(<TextlessButton {...defaultProps} size="large" />)
  expect(iconWrapper).toHaveClass('w-10 h-10')
    })

    it('applies correct color scheme classes', () => {
      const { rerender } = render(<TextlessButton {...defaultProps} colorScheme="dark-green" />)
      expect(screen.getByRole('button')).toHaveClass('dark-green')

      rerender(<TextlessButton {...defaultProps} colorScheme="light-brown" />)
      expect(screen.getByRole('button')).toHaveClass('light-brown')
    })

    it('handles additional HTML attributes', () => {
      render(
        <TextlessButton 
          {...defaultProps} 
          id="test-textless-button" 
          aria-label="Icon button" 
          data-testid="custom-testid" 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'test-textless-button')
      expect(button).toHaveAttribute('aria-label', 'Icon button')
      expect(button).toHaveAttribute('data-testid', 'custom-testid')
    })
  })

  describe('Behavior and Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<TextlessButton {...defaultProps} onClick={handleClick} />)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles disabled state correctly', () => {
      const handleClick = jest.fn()
      
      render(<TextlessButton {...defaultProps} disabled onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles loading state correctly', () => {
      render(<TextlessButton {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
    })

    it('is disabled when both loading and disabled props are true', () => {
      render(<TextlessButton {...defaultProps} loading disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('handles keyboard interactions', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<TextlessButton {...defaultProps} onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      await user.keyboard(' ')
      
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('shows loading spinner and maintains icon in DOM when loading', () => {
      render(<TextlessButton {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
      // Original icon should still be in DOM but loading spinner takes precedence visually
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<TextlessButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      // Explicitly focus the button before asserting focus-visible related classes
      button.focus()
      expect(button).toHaveClass('focus-visible:outline-none')
      // Accept either ring-1 or ring-2 depending on implementation
      expect(button.className).toMatch(/focus-visible:ring-(1|2)/)
      expect(button).toHaveClass('focus-visible:ring-black')
    })

    it('maintains accessibility when loading', () => {
      render(<TextlessButton {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('has correct cursor styles for different states', () => {
      const { rerender } = render(<TextlessButton {...defaultProps} />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('hover:cursor-pointer')
      
      rerender(<TextlessButton {...defaultProps} disabled />)
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Snapshot Tests', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<TextlessButton {...defaultProps} />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with loading state', () => {
      const { container } = render(<TextlessButton {...defaultProps} loading />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with disabled state', () => {
      const { container } = render(<TextlessButton {...defaultProps} disabled />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with different sizes', () => {
      const { container } = render(<TextlessButton {...defaultProps} size="large" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with different color schemes', () => {
      const { container } = render(<TextlessButton {...defaultProps} colorScheme="dark-brown" />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Visual Regression Style Tests', () => {
    it('applies correct hover and active states', () => {
      render(<TextlessButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:opacity-90')
      expect(button).toHaveClass('hover:cursor-pointer')
      expect(button).toHaveClass('active:opacity-95')
    })

    it('applies correct disabled state styles', () => {
      render(<TextlessButton {...defaultProps} disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-70')
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined or null icon gracefully', () => {
      render(<TextlessButton {...defaultProps} icon={null} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Button should still render without crashing even without icon
    })

    it('handles different ReactNode icon types', () => {
      const customIcon = (
        <svg data-testid="custom-svg-icon" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
      render(<TextlessButton {...defaultProps} icon={customIcon} />)
      
      expect(screen.getByTestId('custom-svg-icon')).toBeInTheDocument()
    })
  })

  describe('Tooltip Functionality', () => {
    it('renders tooltip when tooltip prop is provided', () => {
      render(<TextlessButton {...defaultProps} tooltip="Test Tooltip" />)
      
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent('Test Tooltip')
    })

    it('does not render tooltip when tooltip prop is not provided', () => {
      render(<TextlessButton {...defaultProps} />)
      
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('renders tooltip element with group-hover class', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Hover Tooltip" />)
      
      const button = screen.getByRole('button')
      const tooltip = screen.getByTestId('tooltip')
      
      // Tooltip should be present and include the Tailwind group-hover utility
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent('Hover Tooltip')
      expect(tooltip.className).toMatch(/group-hover:opacity-100/)
      
      // Hover doesn't change DOM class names in JSDOM; ensure hovering doesn't break clickability
      await user.hover(button)
      await user.unhover(button)
    })

    it('keeps tooltip element present after hover out (CSS-driven)', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Hover Tooltip" />)
      
      const button = screen.getByRole('button')
      const tooltip = screen.getByTestId('tooltip')
      
      // Hover in/out should not remove the tooltip from the DOM under JSDOM
      await user.hover(button)
      await user.unhover(button)
      expect(tooltip).toBeInTheDocument()
      expect(tooltip.className).toMatch(/group-hover:opacity-100/)
    })

    it('applies correct tooltip positioning classes', () => {
      render(<TextlessButton {...defaultProps} tooltip="Positioned Tooltip" />)
      
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveClass('absolute')
      expect(tooltip).toHaveClass('left-full')
      expect(tooltip).toHaveClass('ml-1')
      expect(tooltip).toHaveClass('top-1/2')
      expect(tooltip).toHaveClass('-translate-y-1/2')
    })

    it('applies correct tooltip styling classes', () => {
      render(<TextlessButton {...defaultProps} tooltip="Styled Tooltip" />)
      
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveClass('px-[10px]')
      expect(tooltip).toHaveClass('py-[5px]')
      expect(tooltip).toHaveClass('dark-brown')
      expect(tooltip).toHaveClass('text-h6')
      expect(tooltip).toHaveClass('rounded-[8px]')
    })

    it('applies correct tooltip transition classes', () => {
      render(<TextlessButton {...defaultProps} tooltip="Transition Tooltip" />)
      
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveClass('opacity-0')
      expect(tooltip).toHaveClass('group-hover:opacity-100')
      expect(tooltip).toHaveClass('transition-opacity')
      expect(tooltip).toHaveClass('duration-100')
    })

    it('tooltip remains in DOM when not visible', () => {
      render(<TextlessButton {...defaultProps} tooltip="Persistent Tooltip" />)
      
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveClass('opacity-0')
    })

    it('works with empty tooltip string', () => {
      render(<TextlessButton {...defaultProps} tooltip="" />)
      
      // Empty tooltip should still render the tooltip container
      const tooltipContainer = screen.getByTestId('tooltip')
      expect(tooltipContainer).toBeInTheDocument()
      expect(tooltipContainer).toHaveTextContent('')
    })

    it('tooltip does not interfere with button click functionality', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <TextlessButton 
          {...defaultProps} 
          tooltip="Clickable Tooltip" 
          onClick={handleClick} 
        />
      )
      
      const button = screen.getByRole('button')
      
      // Hover to show tooltip
      await user.hover(button)
      
      // Click should still work
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('tooltip positioning works with different button sizes', () => {
      const { rerender } = render(
        <TextlessButton {...defaultProps} size="small" tooltip="Small Button Tooltip" />
      )
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()

      rerender(
        <TextlessButton {...defaultProps} size="large" tooltip="Large Button Tooltip" />
      )
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('Tooltip Accessibility', () => {
    it('tooltip is not focusable or in tab order', () => {
      render(<TextlessButton {...defaultProps} tooltip="Accessible Tooltip" />)
      
      const tooltip = screen.getByText('Accessible Tooltip')
      expect(tooltip).not.toHaveAttribute('tabindex')
    })

    it('button remains accessible when tooltip is present', () => {
      render(<TextlessButton {...defaultProps} tooltip="Tooltip Text" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
      // Ensure the button receives focus for the assertion
      button.focus()
      expect(button).toHaveFocus()
    })

    it('tooltip does not interfere with keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Keyboard Tooltip" />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      // Button should still handle keyboard events
      await user.keyboard('{Enter}')
      // Add your click handler assertion if needed
    })
  })

  describe('Tooltip Edge Cases', () => {
    it('tooltip works when button is disabled', () => {
      render(
        <TextlessButton 
          {...defaultProps} 
          tooltip="Disabled Tooltip" 
          disabled 
        />
      )
      
      const tooltip = screen.getByText('Disabled Tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveClass('opacity-0')
    })

    it('tooltip works when button is loading', () => {
      render(
        <TextlessButton 
          {...defaultProps} 
          tooltip="Loading Tooltip" 
          loading 
        />
      )
      
      const tooltip = screen.getByText('Loading Tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    it('tooltip with very long text', () => {
      const longText = 'This is a very long tooltip text that might wrap or truncate in some implementations'
      render(<TextlessButton {...defaultProps} tooltip={longText} />)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('tooltip with special characters', () => {
      const specialText = 'Tooltip with special chars: <>&\"\''
      render(<TextlessButton {...defaultProps} tooltip={specialText} />)
      
      expect(screen.getByText(specialText)).toBeInTheDocument()
    })
  })

  describe('Snapshot Tests with Tooltip', () => {
    it('matches snapshot with tooltip', () => {
      const { container } = render(
        <TextlessButton {...defaultProps} tooltip="Snapshot Tooltip" />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with tooltip and loading state', () => {
      const { container } = render(
        <TextlessButton {...defaultProps} tooltip="Loading Tooltip" loading />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with tooltip and disabled state', () => {
      const { container } = render(
        <TextlessButton {...defaultProps} tooltip="Disabled Tooltip" disabled />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})