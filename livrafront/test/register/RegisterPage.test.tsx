import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RegisterPage from '@/app/register/page'

// Mock the components
jest.mock('@/components/button', () => {
  return function Button({ text, onClick, type, loading, children }: any) {
    return (
      <button type={type} onClick={onClick} disabled={loading}>
        {text || children}
      </button>
    )
  }
})

jest.mock('@/components/general-input', () => {
  return function Input({ label, name, value, onChange, error, type, placeholder, required }: any) {
    return (
      <div>
        {label && <label htmlFor={name}>{label}{required && <span>*</span>}</label>}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          aria-label={label}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/date-input', () => {
  return function DateInput({ label, name, value, onChange, error, required }: any) {
    return (
      <div>
        {label && <label htmlFor={name}>{label}{required && <span>*</span>}</label>}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type="date"
          aria-label={label}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/select-country', () => {
  return function CountrySelect({ label, value, onChange, error, required }: any) {
    return (
      <div>
        {label && <label>{label}{required && <span>*</span>}</label>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          <option value="">Selecione um país</option>
          <option value="BR">Brasil</option>
          <option value="US">Estados Unidos</option>
        </select>
        {error && <span role="alert">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/phone-input', () => {
  return function PhoneInputComponent({ label, value, onChange, error, required }: any) {
    return (
      <div>
        {label && <label>{label}{required && <span>*</span>}</label>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="tel"
          aria-label={label}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    )
  }
})

jest.mock('@/components/password-strength', () => {
  return function PasswordStrength() {
    return <div>Password Strength Indicator</div>
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />
}))

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

jest.mock('libphonenumber-js', () => ({
  isValidPhoneNumber: jest.fn(() => true)
}))

// Mock framer-motion to render children immediately without animations
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef(({ children, onClick, animate, style, className, ...props }: any, ref: any) => (
        <div ref={ref} onClick={onClick} style={style} className={className} {...props}>
          {children}
        </div>
      )),
      form: React.forwardRef(({ children, onSubmit, className, ...props }: any, ref: any) => (
        <form ref={ref} onSubmit={onSubmit} className={className} {...props}>
          {children}
        </form>
      ))
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
  }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Step 1 - Basic Information', () => {
    it('renders step 1 form fields', () => {
      render(<RegisterPage />)
      
      expect(screen.getByLabelText(/Nome de Usuário/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument()
    })

    it('renders the page title and description', () => {
      render(<RegisterPage />)
      
      expect(screen.getByText('Cadastre-se!')).toBeInTheDocument()
      expect(screen.getByText('Junte-se à nossa comunidade de leitores')).toBeInTheDocument()
    })

    it('shows validation errors when submitting empty form', async () => {
      render(<RegisterPage />)
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
        expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      render(<RegisterPage />)
      
      const passwordInput = screen.getByLabelText(/^Senha$/i)
      fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } })
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
      })
    })

    it('validates password confirmation match', async () => {
      render(<RegisterPage />)
      
      const passwordInput = screen.getByLabelText(/^Senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/Confirmar Senha/i)
      
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'different123' } })
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument()
      })
    })

    it('clears errors when user starts typing', async () => {
      render(<RegisterPage />)
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/Nome de Usuário/i)
      fireEvent.change(nameInput, { target: { name: 'name', value: 'John' } })

      await waitFor(() => {
        expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument()
      })
    })

    it('advances to step 2 when step 1 is valid', async () => {
      render(<RegisterPage />)
      
      fireEvent.change(screen.getByLabelText(/Nome de Usuário/i), { target: { name: 'name', value: 'John Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { name: 'email', value: 'john@example.com' } })
      fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { name: 'password', value: 'password123' } })
      fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { name: 'confirmPassword', value: 'password123' } })
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Informações adicionais')).toBeInTheDocument()
      })
    })
  })

  describe('Step 2 - Additional Information', () => {
    const fillStep1AndAdvance = async () => {
      fireEvent.change(screen.getByLabelText(/Nome de Usuário/i), { target: { name: 'name', value: 'John Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { name: 'email', value: 'john@example.com' } })
      fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { name: 'password', value: 'password123' } })
      fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { name: 'confirmPassword', value: 'password123' } })
      
      const submitButton = screen.getByText(/Próximo Passo/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Informações adicionais')).toBeInTheDocument()
      })
    }

    it('renders step 2 form fields', async () => {
      render(<RegisterPage />)
      await fillStep1AndAdvance()

      expect(screen.getByLabelText(/Data de Nascimento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/País/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument()
    })

    it('shows back button on step 2', async () => {
      render(<RegisterPage />)
      await fillStep1AndAdvance()

      expect(screen.getByText('Voltar')).toBeInTheDocument()
    })

    it('goes back to step 1 when clicking back button', async () => {
      render(<RegisterPage />)
      await fillStep1AndAdvance()

      const backButton = screen.getByText('Voltar')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByText('Junte-se à nossa comunidade de leitores')).toBeInTheDocument()
      })
    })

    it('validates required fields on step 2', async () => {
      render(<RegisterPage />)
      await fillStep1AndAdvance()

      const submitButton = screen.getByText(/Finalizar Cadastro/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Data de nascimento é obrigatória')).toBeInTheDocument()
        expect(screen.getByText('País é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Telefone é obrigatório')).toBeInTheDocument()
      })
    })

    it('validates minimum age requirement', async () => {
      render(<RegisterPage />)
      await fillStep1AndAdvance()

      const today = new Date()
      const recentDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
      const dateString = recentDate.toISOString().split('T')[0]

      fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { name: 'birthDate', value: dateString } })
      
      const submitButton = screen.getByText(/Finalizar Cadastro/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Você deve ter pelo menos 13 anos')).toBeInTheDocument()
      })
    })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock

    it('envia o formulário com dados válidos e redireciona', async () => {
      render(<RegisterPage />)

      // Preencher e avançar step 1
      await fillStep1AndAdvance()

      // Step 2
      const thirteenYearsAgo = new Date()
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13)
      const birthDate = thirteenYearsAgo.toISOString().split('T')[0]

      fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), {
        target: { name: 'birthDate', value: birthDate },
      })
      fireEvent.change(screen.getByLabelText(/País/i), {
        target: { value: 'BR' },
      })
      fireEvent.change(screen.getByLabelText(/Telefone/i), {
        target: { value: '+5511999999999' },
      })

      const submitButton = screen.getByText(/Finalizar Cadastro/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/register', expect.anything())
      })
    })

    it('exibe erro se o email já estiver em uso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Email em uso' }),
      })

      render(<RegisterPage />)
      await fillStep1AndAdvance()

      // Preenche campos obrigatórios da etapa 2 para permitir submissão
      fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { name: 'birthDate', value: '2000-01-01' } })
      fireEvent.change(screen.getByLabelText(/País/i), { target: { value: 'BR' } })
      fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '+5511999999999' } })

      const submitButton = screen.getByText(/Finalizar Cadastro/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email em uso')).toBeInTheDocument() //toast
      })
    })

    it('exibe erro se o nome de usuário já estiver em uso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Nome de usuário em uso' }),
      })

      render(<RegisterPage />)
      await fillStep1AndAdvance()

      // Preenche campos obrigatórios da etapa 2 para permitir submissão
      fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { name: 'birthDate', value: '2000-01-01' } })
      fireEvent.change(screen.getByLabelText(/País/i), { target: { value: 'BR' } })
      fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '+5511999999999' } })

      const submitButton = screen.getByText(/Finalizar Cadastro/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Nome de usuário em uso')).toBeInTheDocument() //toast
      })
    })
  })

  describe('Navigation and UI', () => {
    it('renders step indicators', () => {
      render(<RegisterPage />)
      
      const cadastreSeElement = screen.getByText('Cadastre-se!')
      const parentElement = cadastreSeElement.closest('div')?.parentElement
      const indicators = parentElement?.querySelectorAll('div[class*="rounded-full"]')
      expect(indicators?.length).toBeGreaterThanOrEqual(2)
    })

    it('renders login link', () => {
      render(<RegisterPage />)
      
      expect(screen.getByText('Já possui uma conta?')).toBeInTheDocument()
      expect(screen.getByText('Faça login')).toBeInTheDocument()
    })

    it('renders terms and privacy links', () => {
      render(<RegisterPage />)
      
      expect(screen.getByText(/Termos de Uso/i)).toBeInTheDocument()
      expect(screen.getByText(/Política de Privacidade/i)).toBeInTheDocument()
    })

    it('renders benefits section on desktop', () => {
      render(<RegisterPage />)
      
      expect(screen.getAllByText('A rede social dos leitores brasileiros')).toHaveLength(2)
      expect(screen.getByText('Acompanhar a sua leitura')).toBeInTheDocument()
      expect(screen.getByText('Conecte-se e interaja')).toBeInTheDocument()
      expect(screen.getByText('Avalie livros e receba recomendações')).toBeInTheDocument()
      expect(screen.getByText('Ganhe XP e participe de competições')).toBeInTheDocument()
    })
  })
})
