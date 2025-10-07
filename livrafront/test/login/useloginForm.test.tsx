import { renderHook, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useLoginForm } from '@/forms/useLoginForm'
import { loginUser } from '@/services/auth'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/services/auth')
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>
const mockPush = jest.fn()

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useLoginForm())

    expect(result.current.formData).toEqual({ email: '', password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.apiError).toBe('')
  })

  it('deve validar campo em tempo real', () => {
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      const mockEvent = {
        target: { name: 'email', value: 'email-invalido' }
      } as React.ChangeEvent<HTMLInputElement>
      
      result.current.handleChange(mockEvent)
    })

    expect(result.current.formData.email).toBe('email-invalido')
    expect(result.current.errors.email).toBeDefined()
  })

  it('deve fazer login com sucesso', async () => {
    const mockResponse = {
      token: 'token-teste',
      user: { id: '1', username: 'teste', email: 'teste@exemplo.com' }
    }

    mockLoginUser.mockResolvedValueOnce(mockResponse)
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'teste@exemplo.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'senha123' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent)
    })

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'teste@exemplo.com',
      password: 'senha123'
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.apiError).toBe('')
  })

  it('deve lidar com erro da API quando login falha', async () => {
    const apiError = new Error('Credenciais inválidas')
    mockLoginUser.mockRejectedValueOnce(apiError)
    
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'teste@exemplo.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'senha123' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent)
    })

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'teste@exemplo.com',
      password: 'senha123'
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.apiError).toBe('Credenciais inválidas') 
    expect(result.current.errors).toEqual({}) 
  })

  it('deve salvar token e user no localStorage após login', async () => {
    const mockResponse = {
      token: 'real-token-123',
      user: { id: '1', username: 'test', email: 'test@test.com' }
    }

    mockLoginUser.mockResolvedValueOnce(mockResponse)
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'real-token-123')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user))
  })

  it('deve redirecionar para página principal/feed após login', async () => {
    const mockResponse = {
      token: 'token-123',
      user: { id: '1', username: 'test', email: 'test@test.com' }
    }

    mockLoginUser.mockResolvedValueOnce(mockResponse)
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent)
    })

    expect(mockPush).toHaveBeenCalledWith('/main')
  })

  it('deve tratar erro de credenciais inválidas', async () => {
    const error401 = new Error('Credenciais inválidas')
    mockLoginUser.mockRejectedValueOnce(error401)
    
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'wrong@test.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'wrongpass' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      } as unknown as React.FormEvent)
    })

    expect(result.current.apiError).toBe('Credenciais inválidas')
    expect(mockPush).not.toHaveBeenCalled()
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

it('deve mostrar erros de validação no submit com dados inválidos', async () => {
  const { result } = renderHook(() => useLoginForm())
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: jest.fn()
    } as unknown as React.FormEvent)
  })
  expect(result.current.errors.email).toBeDefined()
  expect(result.current.errors.password).toBeDefined()
  expect(result.current.isLoading).toBe(false)
})
it('deve mostrar erro de email inválido no submit', async () => {
  const { result } = renderHook(() => useLoginForm())
  act(() => {
    result.current.handleChange({
      target: { name: 'email', value: 'test@example.com' } 
    } as React.ChangeEvent<HTMLInputElement>)
    
    result.current.handleChange({
      target: { name: 'password', value: 'validpassword123' }
    } as React.ChangeEvent<HTMLInputElement>)
  })

  act(() => {
    result.current.formData.email = 'email-invalido' 
    result.current.formData.password = 'ab' 
  })

  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: jest.fn()
    } as unknown as React.FormEvent)
  })

  expect(result.current.errors.email).toBeDefined()
  expect(result.current.errors.password).toBeDefined() 
  expect(mockLoginUser).not.toHaveBeenCalled()
})
it('deve limpar erro quando campo se torna válido', () => {
  const { result } = renderHook(() => useLoginForm())
  act(() => {
    result.current.handleChange({
      target: { name: 'email', value: 'email-invalido' }
    } as React.ChangeEvent<HTMLInputElement>)
  })

  expect(result.current.errors.email).toBeDefined()

  act(() => {
    result.current.handleChange({
      target: { name: 'email', value: 'email@valido.com' }
    } as React.ChangeEvent<HTMLInputElement>)
  })

  expect(result.current.errors.email).toBeUndefined() 
})
})