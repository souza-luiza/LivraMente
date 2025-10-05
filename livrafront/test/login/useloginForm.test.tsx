import { renderHook, act } from '@testing-library/react'
import { useLoginForm } from '@/forms/useLoginForm'
import { loginUser } from '@/services/auth'

jest.mock('@/services/auth')
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>
const mockAlert = jest.fn()
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert,
})

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    // Preenche dados válidos
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'teste@exemplo.com' }
      } as React.ChangeEvent<HTMLInputElement>)
      
      result.current.handleChange({
        target: { name: 'password', value: 'senha123' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    // Faz o submit
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

})