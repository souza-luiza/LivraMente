import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '../../src/components/general-input'

describe('Input Component', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('renders with label when provided', () => {
      render(<Input label="Test Label" />)
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    })

    it('renders with correct id', () => {
      const testId = 'test-input-id'
      render(<Input id={testId} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', testId)
    })

    it('generates unique id when no id provided', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id')
      expect(input.id).toMatch(/^_r_3_/)
    })
  })

  // Variant tests
  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<Input variant="default" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300', 'bg-white')
    })

    it('applies outline variant styles', () => {
      render(<Input variant="outline" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-2', 'bg-transparent')
    })

    it('applies filled variant styles', () => {
      render(<Input variant="filled" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('bg-gray-50', 'border-gray-200')
    })
  })

  // Size tests
  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Input inputSize="small" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-b3', 'small-box')
    })

    it('applies medium size styles', () => {
      render(<Input inputSize="medium" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-b2', 'medium-box')
    })

    it('applies large size styles', () => {
      render(<Input inputSize="large" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-b1', 'large-box')
    })
  })

  // Error and Helper Text
  describe('Error and Helper Text', () => {
    it('displays error message when error is provided', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByText('This field is required')).toHaveClass('text-red-600')
    })

    it('displays helper text when no error is present', () => {
      render(<Input helperText="Please enter your name" />)
      expect(screen.getByText('Please enter your name')).toBeInTheDocument()
      expect(screen.getByText('Please enter your name')).toHaveClass('text-gray-500')
    })

    it('prioritizes error over helper text', () => {
      render(<Input error="Error message" helperText="Helper text" />)
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })

    it('applies error styles to input when error is present', () => {
      render(<Input error="Error message" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })
  })

  // Full Width
  describe('Full Width', () => {
    it('applies full width styles when fullWidth is true', () => {
      render(<Input fullWidth />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full')
    })

    it('does not apply full width styles when fullWidth is false', () => {
      render(<Input fullWidth={false} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-auto')
    })
  })

  // User Interaction
  describe('User Interaction', () => {
    it('handles user input correctly', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('respects disabled prop', async () => {
      const user = userEvent.setup()
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      
      expect(input).toBeDisabled()
      await user.type(input, 'test')
      expect(input).toHaveValue('')
    })

    it('applies disabled styles', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  // Accessibility
  describe('Accessibility', () => {
    it('associates label with input correctly', () => {
      render(<Input label="Username" id="username-input" />)
      const input = screen.getByLabelText('Username')
      expect(input).toHaveAttribute('id', 'username-input')
    })

    it('has proper aria attributes when error is present', () => {
      render(<Input error="Invalid input" aria-invalid="true" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  // Forward Ref
  describe('Forward Ref', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('allows focusing via ref', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      ref.current?.focus()
      expect(ref.current).toHaveFocus()
    })
  })

  // Custom Class Names
  describe('Custom Class Names', () => {
    it('merges custom className with base classes', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('transition-all') // base class
    })
  })

  // Color Scheme
  describe('Color Scheme', () => {
    it('applies color scheme class', () => {
      render(<Input colorScheme="dark-primary" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('dark-primary')
    })
  })
})