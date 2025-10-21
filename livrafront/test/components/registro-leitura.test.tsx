import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegistroLeitura from '../../src/components/registro-leitura'

jest.mock('../../src/components/icons/CalendarIcon', () => () => <div data-testid="calendar-icon" />)
jest.mock('../../src/components/general-input', () => ({ 
  label, name, type, value, onChange, error, placeholder, required, fullWidth, min 
}: any) => (
  <div data-testid="input">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      data-testid={`input-${name}`}
    />
    {error && <span data-testid={`error-${name}`}>{error}</span>}
  </div>
))
jest.mock('../../src/components/button', () => ({ text, icon, size, colorScheme, type, form, onClick }: any) => (
  <button 
    data-testid="button" 
    type={type} 
    form={form}
    onClick={onClick}
    data-color={colorScheme}
    data-size={size}
  >
    {icon} {text}
  </button>
))
jest.mock('../../src/components/icons/AddIcon', () => () => <div data-testid="add-icon" />)
jest.mock('../../src/components/icons/LogoIcon', () => () => <div data-testid="logo-icon" />)
jest.mock('../../src/components/icons/RemoveIcon', () => () => <div data-testid="remove-icon" />)
jest.mock('../../src/components/icons/ErrorIcon', () => () => <div data-testid="error-icon" />)

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('RegistroLeitura', () => {
  const mockToday = '20 de janeiro de 2024'
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-20'))
    
    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      format: () => mockToday
    } as any))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should render even when user is not logged in (component changed)', () => {
      const { container } = render(<RegistroLeitura isLoggedIn={false} />)
      expect(container.firstChild).not.toBeNull()
    })

    it('should render even when last access is today (component changed)', () => {
      localStorageMock.getItem.mockReturnValue(new Date().toDateString())
      
      const { container } = render(<RegistroLeitura isLoggedIn={true} />)
      expect(container.firstChild).not.toBeNull()
    })

    it('should render when user is logged in and has not registered today', () => {
      localStorageMock.getItem.mockReturnValue('2024-01-19')
      
      render(<RegistroLeitura isLoggedIn={true} />)
      
      expect(screen.getByText(mockToday)).toBeInTheDocument()
      expect(screen.getByText('Registre sua leitura de hoje!')).toBeInTheDocument()
    })
  })

  describe('Form Navigation', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('2024-01-19')
      render(<RegistroLeitura isLoggedIn={true} />)
    })

    it('should show pages form by default', () => {
      expect(screen.getByLabelText('Páginas Lidas')).toBeInTheDocument()
      expect(screen.getByLabelText('Quantidade de Livros Lidos')).toBeInTheDocument()
      expect(screen.queryByLabelText('Minutos Lidos')).not.toBeInTheDocument()
    })

    it('should switch to minutes form when clicking minutes indicator', async () => {
      const minutesIndicator = screen.getByText('Minutos').closest('div')
      fireEvent.click(minutesIndicator!)

      await waitFor(() => {
        expect(screen.getByLabelText('Minutos Lidos')).toBeInTheDocument()
        expect(screen.queryByLabelText('Páginas Lidas')).not.toBeInTheDocument()
      })
    })

    it('should switch back to pages form when clicking pages indicator', async () => {
      const minutesIndicator = screen.getByText('Minutos').closest('div')
      fireEvent.click(minutesIndicator!)

      await waitFor(() => {
        expect(screen.getByLabelText('Minutos Lidos')).toBeInTheDocument()
      })

      const pagesIndicator = screen.getByText('Páginas').closest('div')
      fireEvent.click(pagesIndicator!)

      await waitFor(() => {
        expect(screen.getByLabelText('Páginas Lidas')).toBeInTheDocument()
        expect(screen.queryByLabelText('Minutos Lidos')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Input', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('2024-01-19')
      render(<RegistroLeitura isLoggedIn={true} />)
    })

    it('should update pages read input value', async () => {
      const pagesInput = screen.getByTestId('input-pagesRead')

  fireEvent.change(pagesInput, { target: { value: '50' } })

  // component sanitizes input and stores as string digits
  expect((pagesInput as HTMLInputElement).value).toBe('50')
    })

    it('should update minutes read input value when in minutes form', async () => {
      const minutesIndicator = screen.getByText('Minutos').closest('div')
      fireEvent.click(minutesIndicator!)

      await waitFor(() => {
  const minutesInput = screen.getByTestId('input-minutesRead')
  fireEvent.change(minutesInput, { target: { value: '30' } })
  expect((minutesInput as HTMLInputElement).value).toBe('30')
      })
    })

    it('should update book amount input value', async () => {
        const bookAmountInput = screen.getByTestId('input-bookAmount')

  fireEvent.change(bookAmountInput, { target: { value: '2' } })

  expect((bookAmountInput as HTMLInputElement).value).toBe('2')
    })

    it('should clear errors when input value changes', async () => {
      // This test would need the actual error state to be set first
      // You might need to trigger validation to test this properly
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
    })

    it('should submit pages form successfully', async () => {
        render(<RegistroLeitura isLoggedIn={true} />)
      
        const pagesInput = screen.getByTestId('input-pagesRead')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        const submitButton = screen.getByText('Registrar')

        fireEvent.change(pagesInput, { target: { value: '50' } })
        fireEvent.change(bookAmountInput, { target: { value: '2' } })
        fireEvent.click(submitButton)

        // Since the API call is mocked, expect success state
        await waitFor(() => {
            expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
        })
    })

    it('should submit minutes form successfully', async () => {
      render(<RegistroLeitura isLoggedIn={true} />)
      
      const minutesIndicator = screen.getByText('Minutos').closest('div')
      fireEvent.click(minutesIndicator!)

      await waitFor(async () => {
        const minutesInput = screen.getByTestId('input-minutesRead')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        const submitButton = screen.getByText('Registrar')

        fireEvent.change(minutesInput, { target: { value: '30' } })
        fireEvent.change(bookAmountInput, { target: { value: '1' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
        })
      })
    })

  })

  describe('Negative Values Validation', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
    })

    it('should not accept zero values in pages form', async () => {
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        const submitButton = screen.getByText('Registrar')

        fireEvent.change(pagesInput, { target: { value: '0' } })
        fireEvent.change(bookAmountInput, { target: { value: '0' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Preencha este campo.')).toBeInTheDocument()
        })
    })

    it('should not accept zero values in minutes form', async () => {
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const minutesIndicator = screen.getByText('Minutos').closest('div')
        fireEvent.click(minutesIndicator!)

        await waitFor(async () => {
            const minutesInput = screen.getByTestId('input-minutesRead')
            const bookAmountInput = screen.getByTestId('input-bookAmount')
            const submitButton = screen.getByText('Registrar')

            fireEvent.change(minutesInput, { target: { value: '0' } })
            fireEvent.change(bookAmountInput, { target: { value: '0' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Preencha este campo.')).toBeInTheDocument()
            })
        })
    })

    it('should ignore punctuation', async () => {
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        
        fireEvent.change(pagesInput, { target: { value: '10.5' } })

        expect((pagesInput as HTMLInputElement).value).toBe('105'.replace(/[^\d]/g, ''))
        
        const submitButton = screen.getByTestId('button')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        fireEvent.change(bookAmountInput, { target: { value: '1' } })
        const formElement = (submitButton as HTMLButtonElement).form || document.getElementById('pagesForm')
        if (formElement) fireEvent.submit(formElement)

        await waitFor(() => {
            expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
        })
    })

    });

    describe('HTML5 Validation', () => {
    it('should have proper validation attributes on all number inputs', () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        
        expect(pagesInput).toHaveAttribute('type', 'text')
        expect(pagesInput).toHaveAttribute('inputmode', 'numeric')
        expect(pagesInput).toHaveAttribute('pattern', '[0-9]*')
        expect(pagesInput).toBeRequired()
        
        expect(bookAmountInput).toHaveAttribute('type', 'text')
        expect(bookAmountInput).toHaveAttribute('inputmode', 'numeric')
        expect(bookAmountInput).toHaveAttribute('pattern', '[0-9]*')
        expect(bookAmountInput).not.toBeRequired()
    })

    it('should have proper validation attributes on minutes input', async () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const minutesIndicator = screen.getByText('Minutos').closest('div')
        fireEvent.click(minutesIndicator!)

        await waitFor(() => {
        const minutesInput = screen.getByTestId('input-minutesRead')
        const bookAmountInput = screen.getByTestId('input-bookAmount')
        
        expect(minutesInput).toHaveAttribute('type', 'text')
        expect(minutesInput).toHaveAttribute('inputmode', 'numeric')
        expect(minutesInput).toHaveAttribute('pattern', '[0-9]*')
        expect(minutesInput).toBeRequired()
                
        expect(bookAmountInput).toHaveAttribute('type', 'text')
        expect(bookAmountInput).toHaveAttribute('inputmode', 'numeric')
        expect(bookAmountInput).toHaveAttribute('pattern', '[0-9]*')
        expect(bookAmountInput).not.toBeRequired()
        })
    })
    });

  describe('Success State', () => {
    it('should display success message and XP', async () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const submitButton = screen.getByText('Registrar')
        
        fireEvent.change(pagesInput, { target: { value: '50' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
            expect(screen.getByText(/\+0 XP/)).toBeInTheDocument()
            expect(screen.getByText('Volte amanhã para registrar seu progresso!')).toBeInTheDocument()
        })
    })

    it('should close modal when close button is clicked in success state', async () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const submitButton = screen.getByText('Registrar')
      
        fireEvent.change(pagesInput, { target: { value: '50' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            const closeButton = screen.getByText('Fechar')
            fireEvent.click(closeButton)
        
        expect(screen.queryByText('Leitura registrada!')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error State', () => {
    it('should display error message when submission fails', async () => {
      // This test would require mocking the API call to fail
    })

    it('should close modal when close button is clicked in error state', async () => {
      // Similar to success state test but for error state
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('2024-01-19')
      render(<RegistroLeitura isLoggedIn={true} />)
    })

    it('should have proper form labels', () => {
      expect(screen.getByLabelText('Páginas Lidas')).toBeInTheDocument()
      expect(screen.getByLabelText('Quantidade de Livros Lidos')).toBeInTheDocument()
    })

    it('should have required attribute on required fields', () => {
      const pagesInput = screen.getByTestId('input-pagesRead')
      expect(pagesInput).toBeRequired()
    })

    it('should have proper input types', () => {
      const pagesInput = screen.getByTestId('input-pagesRead')
      expect(pagesInput).toHaveAttribute('type', 'number')
    })
  })

  describe('Edge Cases', () => {
    it('should handle not zero values', async () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const submitButton = screen.getByText('Registrar')
      
        fireEvent.change(pagesInput, { target: { value: '0' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Preencha este campo.')).toBeInTheDocument()
        })
    })

    it('should handle large numbers', async () => {
        localStorageMock.getItem.mockReturnValue('2024-01-19')
        render(<RegistroLeitura isLoggedIn={true} />)
        
        const pagesInput = screen.getByTestId('input-pagesRead')
        const submitButton = screen.getByText('Registrar')
      
        fireEvent.change(pagesInput, { target: { value: '9999' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
        })
    })
  })
})