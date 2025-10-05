import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginPage from '@/app/login/page'
import { loginUser } from '@/services/auth'

jest.mock('@/services/auth')
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>

const mockAlert = jest.fn()
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert,
})

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

  //Teste de login com credenciais válidas
  it('deve fazer login com sucesso', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      token: 'token-teste',
      user: { id: '1', username: 'teste', email: 'teste@exemplo.com' }
    }
    
    mockLoginUser.mockResolvedValueOnce(mockResponse)
    render(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText('Email ou nome de usuário'), 'teste@exemplo.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'senha123')
    await user.click(screen.getByText('Acessar'))
    
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'teste@exemplo.com',
        password: 'senha123'
      })
    })
    expect(mockAlert).toHaveBeenCalledWith('Bem-vindo teste')
  })

  //Teste de login com credenciais inválidas
  it('deve mostrar erro quando login falha', async () => {
    const user = userEvent.setup()
    mockLoginUser.mockRejectedValueOnce(new Error('Credenciais inválidas'))
    
    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText('Email ou nome de usuário'), 'wrong@email.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'wrongpass')
    await user.click(screen.getByText('Acessar'))
    
    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas/)).toBeInTheDocument()
    })
  })

  it('deve desabilitar botão durante loading', async () => {
    const user = userEvent.setup()
    
    mockLoginUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        token: 'test-token',
        user: { id: '1', username: 'test', email: 'test@test.com' }
      }), 100))
    )
    
    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText('Email ou nome de usuário'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'password123')
    await user.click(screen.getByText('Acessar'))
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent(/carregando/i)
    })
  })
})