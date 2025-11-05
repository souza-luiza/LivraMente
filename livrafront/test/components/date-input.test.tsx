import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateInput from '@/components/date-input'

// Mock do cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: any[]) => classes.flat().filter(Boolean).join(' ')
}))

describe('DateInput', () => {
  it('should render a date input', () => {
    const { container } = render(<DateInput />)
    const input = container.querySelector('input[type="date"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'date')
  })

  it('should render with label', () => {
    render(<DateInput label="Data de Nascimento" />)
    expect(screen.getByText('Data de Nascimento')).toBeInTheDocument()
  })

  it('should render required asterisk when required', () => {
    render(<DateInput label="Data" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should render error message', () => {
    render(<DateInput error="Data inválida" />)
    expect(screen.getByText('Data inválida')).toBeInTheDocument()
  })

  it('should render helper text when no error', () => {
    render(<DateInput helperText="Formato: DD/MM/AAAA" />)
    expect(screen.getByText('Formato: DD/MM/AAAA')).toBeInTheDocument()
  })

  it('should not render helper text when error is present', () => {
    render(<DateInput helperText="Helper" error="Erro" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
    expect(screen.getByText('Erro')).toBeInTheDocument()
  })

  it('should apply default variant classes', () => {
    const { container } = render(<DateInput variant="default" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-gray-300 bg-white')
  })

  it('should apply outline variant classes', () => {
    const { container } = render(<DateInput variant="outline" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-2 bg-transparent')
  })

  it('should apply filled variant classes', () => {
    const { container } = render(<DateInput variant="filled" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('bg-gray-50')
  })

  it('should apply small size classes', () => {
    const { container } = render(<DateInput inputSize="small" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('small-box text-b3')
  })

  it('should apply medium size classes', () => {
    const { container } = render(<DateInput inputSize="medium" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('medium-box text-b2')
  })

  it('should apply large size classes', () => {
    const { container } = render(<DateInput inputSize="large" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('large-box text-b1')
  })

  it('should apply fullWidth class', () => {
    const { container } = render(<DateInput fullWidth />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('w-full')
  })

  it('should apply custom className', () => {
    const { container } = render(<DateInput className="custom-class" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('custom-class')
  })

  it('should accept a value', () => {
    const { container } = render(<DateInput value="2024-01-15" readOnly />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('2024-01-15')
  })

  it('should handle onChange event', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    const { container } = render(<DateInput onChange={handleChange} />)
    const input = container.querySelector('input') as HTMLInputElement
    
    await user.type(input, '2024-01-15')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is passed', () => {
    const { container } = render(<DateInput disabled />)
    const input = container.querySelector('input')
    expect(input).toBeDisabled()
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<DateInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should use custom id when provided', () => {
    render(<DateInput id="custom-id" label="Data" />)
    const input = screen.getByLabelText('Data')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('should generate random id when not provided', () => {
    const { container } = render(<DateInput />)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('id')
    expect(input?.getAttribute('id')).toMatch(/^date-input-/)
  })

  it('should apply error styling when error prop is present', () => {
    const { container } = render(<DateInput error="Erro" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-red-500 focus:ring-red-500')
  })
})