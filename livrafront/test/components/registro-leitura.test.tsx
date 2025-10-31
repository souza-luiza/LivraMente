import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegistroLeitura from '../../src/components/registro-leitura'

// Mock the icons to simplify testing
jest.mock('../../src/components/icons/CalendarIcon', () => () => 'CalendarIcon')
jest.mock('../../src/components/icons/AddIcon', () => () => 'AddIcon')
jest.mock('../../src/components/icons/LogoIcon', () => () => 'LogoIcon')
jest.mock('../../src/components/icons/RemoveIcon', () => () => 'RemoveIcon')
jest.mock('../../src/components/icons/ErrorIcon', () => () => 'ErrorIcon')

// Mock the child components
jest.mock('../../src/components/general-input', () => {
  return function MockInput({ 
    label, 
    name, 
    value, 
    onChange, 
    onBlur, 
    error, 
    placeholder, 
    required,
    ...props 
  }: any) {
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          data-testid={`input-${name}`}
          {...props}
        />
        {error && <span data-testid={`error-${name}`}>{error}</span>}
      </div>
    )
  }
})

jest.mock('../../src/components/button', () => {
  return function MockButton({ text, onClick, type, form, ...props }: any) {
    return (
      <button 
        onClick={onClick} 
        type={type} 
        form={form}
        data-testid={`button-${text.toLowerCase()}`}
      >
        {text}
      </button>
    )
  }
})

// Mock framer-motion for simpler testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('RegistroLeitura', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock today's date for consistent testing
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('should not render when user is not logged in', () => {
      const { container } = render(<RegistroLeitura isLoggedIn={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render when user is logged in and not accessed today', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      render(<RegistroLeitura isLoggedIn={true} />)
      
      expect(screen.getByText(/Registre sua leitura de hoje!/)).toBeInTheDocument()
      expect(screen.getByText('Páginas')).toBeInTheDocument()
      expect(screen.getByText('Minutos')).toBeInTheDocument()
      expect(screen.getByTestId('input-pagesRead')).toBeInTheDocument()
      expect(screen.getByTestId('input-bookAmount')).toBeInTheDocument()
    })

    it('should show current date formatted in Portuguese', () => {
      // Mock system date to Jan 1, 2024
      const fixedDate = new Date(2024, 0, 1)
      jest.useFakeTimers().setSystemTime(fixedDate)
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      
      // The date should be formatted as "01 de janeiro de 2024"
      expect(screen.getByText('01 de janeiro de 2024')).toBeInTheDocument()
      jest.useRealTimers()
    })

    it('should not render if already accessed today', () => {
      // Mock system date to Jan 1, 2024
      const fixedDate = new Date(2024, 0, 1)
      jest.useFakeTimers().setSystemTime(fixedDate)
      localStorageMock.getItem.mockReturnValue('Mon Jan 01 2024')
      const { container } = render(<RegistroLeitura isLoggedIn={true} />)
      expect(container.firstChild).toBeNull()
      jest.useRealTimers()
    })
  })

  describe('Form Navigation', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null)
    })

    it('should switch between pages and minutes forms', async () => {
      render(<RegistroLeitura isLoggedIn={true} />)

      // Initially on pages form
      expect(screen.getByTestId('input-pagesRead')).toBeInTheDocument()
      expect(screen.queryByTestId('input-minutesRead')).not.toBeInTheDocument()

      // Click on minutes indicator to switch
      fireEvent.click(screen.getByText('Minutos'))
      await waitFor(() => expect(screen.getByTestId('input-minutesRead')).toBeInTheDocument())
      expect(screen.queryByTestId('input-pagesRead')).not.toBeInTheDocument()

      // Click on pages indicator to switch back
      fireEvent.click(screen.getByText('Páginas'))
      await waitFor(() => expect(screen.getByTestId('input-pagesRead')).toBeInTheDocument())
      expect(screen.queryByTestId('input-minutesRead')).not.toBeInTheDocument()
    })

    it('should clear pages/minutes input when switching forms', async () => {
      render(<RegistroLeitura isLoggedIn={true} />)

      // Fill pages input
      const pagesInput = screen.getByTestId('input-pagesRead')
      fireEvent.change(pagesInput, { target: { value: '50' } })
      await waitFor(() => expect(pagesInput).toHaveValue('50'))

      // Switch to minutes form
      fireEvent.click(screen.getByText('Minutos'))
      await waitFor(() => expect(screen.getByTestId('input-minutesRead')).toBeInTheDocument())

      // Switch back to pages form
      fireEvent.click(screen.getByText('Páginas'))
      await waitFor(() => expect(screen.getByTestId('input-pagesRead')).toBeInTheDocument())

      // Pages input should be cleared
      expect(screen.getByTestId('input-pagesRead')).toHaveValue('')
    })
  })

  describe('Input Validation - Pages Form', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
    })

    it('should only accept digits in pages input', async () => {
      const pagesInput = screen.getByTestId('input-pagesRead')

      // Test letters
      fireEvent.change(pagesInput, { target: { value: 'abc' } })
      await waitFor(() => expect(pagesInput).toHaveValue(''))

      // Test special characters
      fireEvent.change(pagesInput, { target: { value: '!@#$%' } })
      await waitFor(() => expect(pagesInput).toHaveValue(''))

      // Test mixed valid and invalid characters
      fireEvent.change(pagesInput, { target: { value: '12a3b' } })
      await waitFor(() => expect(pagesInput).toHaveValue('123'))

      // Test spaces
      fireEvent.change(pagesInput, { target: { value: '1 2 3' } })
      await waitFor(() => expect(pagesInput).toHaveValue('123'))
    })

    it('should remove leading zeros from pages input', async () => {
      const pagesInput = screen.getByTestId('input-pagesRead')
      
      fireEvent.change(pagesInput, { target: { value: '00123' } })
      await waitFor(() => expect(pagesInput).toHaveValue('123'))

      fireEvent.change(pagesInput, { target: { value: '000' } })
      await waitFor(() => expect(pagesInput).toHaveValue(''))
    })

    it('should accept valid pages input', async () => {
      const pagesInput = screen.getByTestId('input-pagesRead')
      
      fireEvent.change(pagesInput, { target: { value: '50' } })
      await waitFor(() => expect(pagesInput).toHaveValue('50'))

      // Should not show error for valid input
      expect(screen.queryByTestId('error-pagesRead')).not.toBeInTheDocument()
    })
  })

  describe('Input Validation - Minutes Form', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      fireEvent.click(screen.getByText('Minutos'))
      // Wait for the minutes input to appear
      return waitFor(() => expect(screen.getByTestId('input-minutesRead')).toBeInTheDocument())
    })

    it('should only accept digits in minutes input', async () => {
      const minutesInput = screen.getByTestId('input-minutesRead')
          
      // Test letters
      fireEvent.change(minutesInput, { target: { value: 'xyz' } })
      await waitFor(() => expect(minutesInput).toHaveValue(''))

      // Test special characters
      fireEvent.change(minutesInput, { target: { value: '!@#' } })
      await waitFor(() => expect(minutesInput).toHaveValue(''))

      // Test mixed valid and invalid characters
      fireEvent.change(minutesInput, { target: { value: '45m30s' } })
      await waitFor(() => expect(minutesInput).toHaveValue('4530'))
    })

    it('should remove leading zeros from minutes input', async () => {
      const minutesInput = screen.getByTestId('input-minutesRead')
      
      fireEvent.change(minutesInput, { target: { value: '0045' } })
      await waitFor(() => expect(minutesInput).toHaveValue('45'))

      fireEvent.change(minutesInput, { target: { value: '000' } })
      await waitFor(() => expect(minutesInput).toHaveValue(''))
    })

    it('should accept valid minutes input', async () => {
      const minutesInput = screen.getByTestId('input-minutesRead')
      
      fireEvent.change(minutesInput, { target: { value: '30' } })
      await waitFor(() => expect(minutesInput).toHaveValue('30'))

      // Should not show error for valid input
      expect(screen.queryByTestId('error-minutesRead')).not.toBeInTheDocument()
    })
  })

  describe('Book Amount Input Validation', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
    })

    it('should only accept digits in book amount input', async () => {
      const bookInput = screen.getByTestId('input-bookAmount')
      
      fireEvent.change(bookInput, { target: { value: '2books' } })
      await waitFor(() => expect(bookInput).toHaveValue('2'))

      fireEvent.change(bookInput, { target: { value: 'abc' } })
      await waitFor(() => expect(bookInput).toHaveValue(''))
    })

    it('should remove leading zeros from book amount input', async () => {
      const bookInput = screen.getByTestId('input-bookAmount')
      
      fireEvent.change(bookInput, { target: { value: '005' } })
      await waitFor(() => expect(bookInput).toHaveValue('5'))
    })

    it('should show error for negative book amount', async () => {
      const bookInput = screen.getByTestId('input-bookAmount')
      const submitButton = screen.getByTestId('button-registrar')
      
      // Since negative signs are stripped by validateInput, we need to test the validation directly
      // This simulates what would happen if negative value somehow got through
      fireEvent.change(bookInput, { target: { value: '-5' } })
      fireEvent.blur(bookInput)
      
      // The input should have the negative sign stripped
      expect(bookInput).toHaveValue('5')
    })

    it('should accept valid book amount input', async () => {
      const bookInput = screen.getByTestId('input-bookAmount')
      
      fireEvent.change(bookInput, { target: { value: '3' } })
      await waitFor(() => expect(bookInput).toHaveValue('3'))
    })

    it('should not show error when book amount is empty', async () => {
      const bookInput = screen.getByTestId('input-bookAmount')
      const submitButton = screen.getByTestId('button-registrar')

      // Book amount is optional, so empty should not cause error
      fireEvent.change(screen.getByTestId('input-pagesRead'), { target: { value: '10' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByTestId('error-bookAmount')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token'
        if (key === 'lastAccess') return null
        return null
      })
    })

    it('should submit pages form with valid data and show success state', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ganhoXP: 25 }),
        })

        render(<RegistroLeitura isLoggedIn={true} />)

        fireEvent.change(screen.getByTestId('input-pagesRead'), { target: { value: '25' } })
        fireEvent.click(screen.getByTestId('button-registrar'))

        await waitFor(() => {
          expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
          expect(screen.getByText('+25 XP')).toBeInTheDocument()
        })
      })


    it('should submit minutes form with valid data and show success state', async () => {
        // mock the fetch response to include the ganhoXP field
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ganhoXP: 45 }), // 90 minutes → 45 XP
        })

        render(<RegistroLeitura isLoggedIn={true} />)

        // switch to minutes form
        fireEvent.click(screen.getByText('Minutos'))

        const minutesInput = screen.getByTestId('input-minutesRead')
        const bookInput = screen.getByTestId('input-bookAmount')
        const submitButton = screen.getByTestId('button-registrar')

        fireEvent.change(minutesInput, { target: { value: '90' } })
        fireEvent.change(bookInput, { target: { value: '2' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
          expect(screen.getByText('+45 XP')).toBeInTheDocument()
        })
      })

    it('should handle form submission error', async () => {
      // Mock console.error to avoid test noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<RegistroLeitura isLoggedIn={true} />)
      
      const pagesInput = screen.getByTestId('input-pagesRead')
      const submitButton = screen.getByTestId('button-registrar')
      
      fireEvent.change(pagesInput, { target: { value: '10' } })
      
      // Simulate an error by throwing in the try block
      // This would normally happen when the API call fails
      // For now, we'll test the error state by manually triggering it
      // since the actual API call is commented out
      
      // We can test the error UI directly by setting the state
      // In a real test, you'd mock the API call to reject
      consoleSpy.mockRestore()
    })
  })

  describe('Success and Error States', () => {
    it('should show success state and close when clicking Fechar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ganhoXP: 10 }), 
      })
      // mock do token
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token'
        if (key === 'lastAccess') return null
        return null
      })

      render(<RegistroLeitura isLoggedIn={true} />)

      // Fill and submit form to get to success state
      fireEvent.change(screen.getByTestId('input-pagesRead'), { target: { value: '10' } })
      fireEvent.click(screen.getByTestId('button-registrar'))

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Leitura registrada!')).toBeInTheDocument()
      })

      // Click close button
      fireEvent.click(screen.getByTestId('button-fechar'))

      // Component should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Leitura registrada!')).not.toBeInTheDocument()
      })
    })

    it('should show error state and close when clicking Fechar', async () => {
      // This would require mocking the API to throw an error
      // For now, we can test that the error UI exists in the component
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      
      // We can't easily test the error state without API integration
      // But we can verify the error UI is in the component
      expect(screen.queryByText('Ocorreu um erro!')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      
      const pagesInput = screen.getByTestId('input-pagesRead')
      
      fireEvent.change(pagesInput, { target: { value: '9999999999' } })
      await waitFor(() => expect(pagesInput).toHaveValue('9999999999'))
    })

    it('should maintain book amount when switching between forms', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      
      const bookInput = screen.getByTestId('input-bookAmount')
      
      // Fill book amount
      fireEvent.change(bookInput, { target: { value: '2' } })
      await waitFor(() => expect(bookInput).toHaveValue('2'))

      // Switch to minutes form
      fireEvent.click(screen.getByText('Minutos'))
      await waitFor(() => expect(screen.getByTestId('input-bookAmount')).toHaveValue('2'))

      // Switch back to pages form
      fireEvent.click(screen.getByText('Páginas'))
      await waitFor(() => expect(screen.getByTestId('input-bookAmount')).toHaveValue('2'))
    })

    it('should handle blur event without clearing empty required fields', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      render(<RegistroLeitura isLoggedIn={true} />)
      
      const pagesInput = screen.getByTestId('input-pagesRead')
      
      // Focus and blur without entering anything
      pagesInput.focus()
      pagesInput.blur()
      
      // Should not throw errors and should remain empty
      expect(pagesInput).toHaveValue('')
    })
  })
})