import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginPage from '@/app/entrar/page'
import { loginUser } from '@/services/auth'
import { useRouter } from 'next/navigation' 

jest.mock('@/services/auth')
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

  //Teste de login com credenciais válidas
  it('deve fazer login com sucesso', async () => {
    const user = userEvent.setup();
    const mockResponse = { _id: '1', username: 'teste', email: 'teste@exemplo.com' };
    
    mockLoginUser.mockResolvedValueOnce(mockResponse as any);
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText('E-mail'), 'teste@exemplo.com');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.click(screen.getByText('Entrar'));
    
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'teste@exemplo.com',
        password: 'senha123'
      })
    })
    
    // Verificar redirecionamento ao invés de alert
    expect(mockPush).toHaveBeenCalledWith(`/${mockResponse.username}`)
  })

  //Teste de login com credenciais inválidas
  it('deve mostrar erro quando login falha', async () => {
    const user = userEvent.setup()
    mockLoginUser.mockRejectedValueOnce(new Error('Credenciais inválidas'))
    
    render(<LoginPage />)
  await user.type(screen.getByLabelText('E-mail'), 'wrong@email.com')
  await user.type(screen.getByLabelText('Senha'), 'wrongpass')
  await user.click(screen.getByText('Entrar'))
    
    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas/)).toBeInTheDocument()
    })
  })
  // Removed redundant test: "deve fazer login e redirecionar para página principal/feed"
})