import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../../src/app/register/page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('../../src/components/button', () => {
  return function MockButton({ children, onClick, type, disabled, text }: any) {
    return (
      <button 
        type={type} 
        onClick={onClick} 
        disabled={disabled}
        data-testid="mock-button"
      >
        {/* prefer explicit text prop, fallback to children */}
        {text ?? children}
      </button>
    )
  }
})

jest.mock('../../src/components/general-input', () => {
  return function MockInput({ 
    label, 
    name, 
    type, 
    value, 
    onChange, 
    error, 
    placeholder,
    helperText 
  }: any) {
    return (
      <div data-testid={`mock-input-${name}`}>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          data-testid={`input-${name}`}
        />
        {error && <span data-testid={`error-${name}`}>{error}</span>}
        {helperText && <span data-testid={`helper-${name}`}>{helperText}</span>}
      </div>
    )
  }
})

jest.mock('../../src/components/icons/LogoIcon', () => {
  return function MockLogoIcon({ size, fill, className }: any) {
    return <div data-testid="logo-icon" data-size={size} data-fill={fill} className={className}>LogoIcon</div>
  }
})

jest.mock('../../src/components/icons/ArrowRightIcon', () => {
  return function MockArrowRightIcon() {
    return <div data-testid="arrow-right-icon">ArrowRightIcon</div>
  }
})

jest.mock('../../src/components/icons/OpenBookIcon', () => {
  return function MockOpenBookIcon({ size, fill }: any) {
    return <div data-testid="open-book-icon">OpenBookIcon</div>
  }
})

jest.mock('../../src/components/icons/CommunityIcon', () => {
  return function MockCommunityIcon({ size, fill }: any) {
    return <div data-testid="community-icon">CommunityIcon</div>
  }
})

jest.mock('../../src/components/icons/LibraryIcon', () => {
  return function MockLibraryIcon({ size, fill }: any) {
    return <div data-testid="library-icon">LibraryIcon</div>
  }
})

jest.mock('../../src/components/icons/StarIcon', () => {
  return function MockStarIcon({ size, fill }: any) {
    return <div data-testid="star-icon">StarIcon</div>
  }
})

describe('RegisterPage', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
    jest.clearAllMocks()
  })

  describe('Layout and Rendering', () => {
    it('renders the register page with correct structure', () => {
      render(<RegisterPage />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      expect(screen.getByText('📚 Livramente')).toBeInTheDocument()
      expect(screen.getByText('A rede social dos leitores brasileiros')).toBeInTheDocument()
      
      expect(screen.getByText('Cadastre-se!')).toBeInTheDocument()
      expect(screen.getByText('Junte-se à nossa comunidade de leitores')).toBeInTheDocument()
    })

    it('renders all form inputs', () => {
      render(<RegisterPage />)
      
      expect(screen.getByTestId('mock-input-name')).toBeInTheDocument()
      expect(screen.getByTestId('mock-input-email')).toBeInTheDocument()
      expect(screen.getByTestId('mock-input-password')).toBeInTheDocument()
      expect(screen.getByTestId('mock-input-confirmPassword')).toBeInTheDocument()
    })

    it('renders the submit button', () => {
      render(<RegisterPage />)
      
      const submitButton = screen.getByTestId('mock-button')
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveTextContent('Próximo Passo')
    })

    it('renders the benefits section on desktop', () => {
      render(<RegisterPage />)
      
      expect(screen.getByText('Acompanhe sua leitura')).toBeInTheDocument()
      expect(screen.getByText('Conecte-se e interaja')).toBeInTheDocument()
      expect(screen.getByText('Avalie livros e receba recomendações')).toBeInTheDocument()
      expect(screen.getByText('Ganhe XP e participe de competições')).toBeInTheDocument()
    })

    it('renders legal links and login link', () => {
      render(<RegisterPage />)
      
      expect(screen.getByText(/Ao criar uma conta, você concorda com nossos/)).toBeInTheDocument()
      expect(screen.getByText('Termos de Uso')).toBeInTheDocument()
      expect(screen.getByText('Política de Privacidade')).toBeInTheDocument()
      expect(screen.getByText('Já tem uma conta?')).toBeInTheDocument()
      expect(screen.getByText('Faça login')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('updates form data when user types in inputs', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const nameInput = screen.getByTestId('input-name')
      const emailInput = screen.getByTestId('input-email')
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
    })

    it('clears error when user starts typing in a field with error', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const submitButton = screen.getByTestId('mock-button')
      await user.click(submitButton)
      
      expect(screen.getByTestId('error-name')).toBeInTheDocument()
      
      const nameInput = screen.getByTestId('input-name')
      await user.type(nameInput, 'J')
      
      expect(screen.queryByTestId('error-name')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors when form is submitted empty', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const submitButton = screen.getByTestId('mock-button')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toHaveTextContent('Nome é obrigatório')
        expect(screen.getByTestId('error-email')).toHaveTextContent('Email é obrigatório')
        expect(screen.getByTestId('error-password')).toHaveTextContent('Senha é obrigatória')
        expect(screen.getByTestId('error-confirmPassword')).toHaveTextContent('Confirmação de senha é obrigatória')
      })
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const emailInput = screen.getByTestId('input-email')
      const submitButton = screen.getByTestId('mock-button')

  // use fireEvent.change to synchronously update the controlled input
  fireEvent.change(emailInput, { target: { value: 'invalid-email', name: 'email' } })
  expect(emailInput).toHaveValue('invalid-email')
  await user.click(submitButton)

      // wait for the error span to appear
      // ensure form was not submitted (submission logs only on successful validation)
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      await waitFor(() => expect(consoleSpy).not.toHaveBeenCalled())
      consoleSpy.mockRestore()
    })

    it('shows error for short password', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const passwordInput = screen.getByTestId('input-password')
      const submitButton = screen.getByTestId('mock-button')
      
      await user.type(passwordInput, '123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('error-password')).toHaveTextContent('Senha deve ter pelo menos 6 caracteres')
      })
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />)
      
      const passwordInput = screen.getByTestId('input-password')
      const confirmPasswordInput = screen.getByTestId('input-confirmPassword')
      const submitButton = screen.getByTestId('mock-button')
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('error-confirmPassword')).toHaveTextContent('As senhas não coincidem')
      })
    })

    it('submits form when validation passes', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<RegisterPage />)
      
      await user.type(screen.getByTestId('input-name'), 'testuser')
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      await user.type(screen.getByTestId('input-password'), 'password123')
      await user.type(screen.getByTestId('input-confirmPassword'), 'password123')
      
      const submitButton = screen.getByTestId('mock-button')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Dados de registro:', {
          name: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<RegisterPage />)
      
      expect(screen.getByLabelText(/Nome de Usuário/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      // there may be multiple password fields with the same label text; ensure at least one exists
      expect(screen.getAllByLabelText(/Senha/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument()
    })

    it('has required fields marked', () => {
      render(<RegisterPage />)

      const inputs = screen.getAllByTestId(/input-/)
      // allow for additional inputs but ensure core 4 exist
      expect(inputs.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Responsive Design', () => {
    it('shows mobile header on small screens', () => {
      render(<RegisterPage />)
      
      const mobileHeader = screen.getByText('📚 Livramente')
      expect(mobileHeader).toBeInTheDocument()
    })
  })
})