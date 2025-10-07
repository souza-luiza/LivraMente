import { loginUser } from '@/services/auth'

global.fetch = jest.fn()

describe('serviço de autenticação', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('deve fazer requisição correta para API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ accessToken: 'token-123' })
    }
    
    ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

    const result = await loginUser({ email: 'test@test.com', password: 'pass123' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', senha: 'pass123' })
    })

    expect(result).toEqual({
      token: 'token-123',
      user: { id: 'user-id', username: 'test@test.com', email: 'test@test.com' }
    })
  })

  it('deve tratar erro 401', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401
    })

    await expect(loginUser({ email: 'wrong', password: 'wrong' }))
      .rejects.toThrow('Credenciais inválidas')
  })
})
