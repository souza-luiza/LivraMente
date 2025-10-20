import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextlessButton from '../../src/components/textless-button'
import LogoIcon from '../../src/components/icons/LogoIcon'

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
      expect(iconWrapper).toHaveClass('w-8 h-8')
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

    it('shows loading spinner and maintains icon in DOM when loading', () => {
      render(<TextlessButton {...defaultProps} loading />)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('Tooltip Functionality', () => {
    it('does not render tooltip when tooltip prop is undefined', () => {
      render(<TextlessButton {...defaultProps} />)
      
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Test Tooltip" />)
      
      const button = screen.getByRole('button')
      
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
      
      await user.hover(button)
      
      await waitFor(() => {
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByTestId('tooltip')).toHaveTextContent('Test Tooltip')
      })
    })

    it('hides tooltip on unhover', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Hover Tooltip" />)
      
      const button = screen.getByRole('button')
      
      await user.hover(button)
      
      await waitFor(() => {
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      })
      
      await user.unhover(button)
      
      await waitFor(() => {
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
      })
    })

    it('applies correct tooltip positioning classes', async () => {
      const user = userEvent.setup()
      render(<TextlessButton {...defaultProps} tooltip="Positioned Tooltip" />)
      
      const button = screen.getByRole('button')
      await user.hover(button)
      
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip')
        expect(tooltip).toHaveClass('absolute')
        expect(tooltip).toHaveClass('left-full')
        expect(tooltip).toHaveClass('ml-2')
        expect(tooltip).toHaveClass('top-1/2')
        expect(tooltip).toHaveClass('-translate-y-1/2')
      })
    })
  })
})