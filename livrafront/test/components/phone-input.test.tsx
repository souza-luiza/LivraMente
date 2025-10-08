import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PhoneInputComponent from '@/components/phone-input'

// Mock the cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('PhoneInputComponent', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders without crashing', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<PhoneInputComponent label="Telefone" value="" onChange={mockOnChange} />)
    expect(screen.getByText('Telefone')).toBeInTheDocument()
  })

  it('renders required asterisk when required is true', () => {
    render(<PhoneInputComponent label="Telefone" value="" onChange={mockOnChange} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders error message when error prop is provided', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('renders helper text when provided and no error', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} helperText="Formato: (11) 99999-9999" />)
    expect(screen.getByText('Formato: (11) 99999-9999')).toBeInTheDocument()
  })

  it('does not render helper text when error is present', () => {
    render(
      <PhoneInputComponent 
        value="" 
        onChange={mockOnChange} 
        error="Campo obrigatório"
        helperText="Formato: (11) 99999-9999" 
      />
    )
    expect(screen.queryByText('Formato: (11) 99999-9999')).not.toBeInTheDocument()
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} placeholder="Insira seu número" />)
    expect(screen.getByPlaceholderText('Insira seu número')).toBeInTheDocument()
  })

  it('renders with default placeholder', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} />)
    expect(screen.getByPlaceholderText('Digite seu telefone')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    render(<PhoneInputComponent value="" onChange={mockOnChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '+55 11 99999-9999' } })
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('renders with correct size classes for small', () => {
    const { container } = render(<PhoneInputComponent value="" onChange={mockOnChange} inputSize="small" />)
    const phoneInput = container.querySelector('.PhoneInput')
    expect(phoneInput).toHaveClass('small-box text-b3')
  })

  it('renders with correct size classes for medium', () => {
    const { container } = render(<PhoneInputComponent value="" onChange={mockOnChange} inputSize="medium" />)
    const phoneInput = container.querySelector('.PhoneInput')
    expect(phoneInput).toHaveClass('medium-box text-b2')
  })

  it('renders with correct size classes for large', () => {
    const { container } = render(<PhoneInputComponent value="" onChange={mockOnChange} inputSize="large" />)
    const phoneInput = container.querySelector('.PhoneInput')
    expect(phoneInput).toHaveClass('large-box text-b1')
  })

  it('renders with fullWidth class when fullWidth is true', () => {
    const { container } = render(<PhoneInputComponent value="" onChange={mockOnChange} fullWidth />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('w-full')
  })

  it('displays the provided value', () => {
    render(<PhoneInputComponent value="+5511999999999" onChange={mockOnChange} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('+55 11 99999 9999')
  })
})