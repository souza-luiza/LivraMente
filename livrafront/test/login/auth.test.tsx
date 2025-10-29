import { loginUser } from '@/services/auth'

global.fetch = jest.fn()

describe('serviço de autenticação', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('deve fazer requisição correta para API', async () => {
    // Mock da primeira requisição (signin)
    const mockSigninResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ accessToken: 'token-123' })
    };
    
    // Mock da segunda requisição (users/me)
    const mockUserResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ 
        _id: 'user-123',
        username: 'testuser',
        email: 'test@test.com' 
      })
    };
    
    // Configurar fetch para retornar respostas diferentes em cada chamada
    (fetch as jest.Mock)
      .mockResolvedValueOnce(mockSigninResponse)  // Primeira chamada: signin
      .mockResolvedValueOnce(mockUserResponse);   // Segunda chamada: users/me

    const result = await loginUser({ email: 'test@test.com', password: 'pass123' });

    // Verificar primeira chamada (signin)
    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:3001/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', senha: 'pass123' })
    });
    
    // Verificar segunda chamada (users/me)
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:3001/users/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer token-123' }
    });

    // Verificar resultado final
    expect(result).toEqual({
      token: 'token-123',
      user: { 
        id: 'user-123',
        username: 'testuser',
        email: 'test@test.com' 
      }
    });
  })

  it('deve tratar erro 401', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401
    })

    await expect(loginUser({ email: 'wrong', password: 'wrong' }))
      .rejects.toThrow('Credenciais inválidas')
  })
it('deve tratar erro 500', async () => {
  ;(fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 500
  })

  await expect(loginUser({ email: 'test', password: 'test' }))
    .rejects.toThrow('Erro interno do servidor')
})

it('deve tratar outros erros HTTP', async () => {
  ;(fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 400
  })

  await expect(loginUser({ email: 'test', password: 'test' }))
    .rejects.toThrow('Erro na requisição')
})

it('deve tratar erro genérico (não Error)', async () => {
  ;(fetch as jest.Mock).mockRejectedValue('String error')

  await expect(loginUser({ email: 'test', password: 'test' }))
    .rejects.toThrow('Erro de rede')
})

it('deve tratar erro ao buscar dados do usuário', async () => {
  // Mock signin com sucesso
  const mockSigninResponse = {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ accessToken: 'token-123' })
  };
  
  // Mock users/me com erro
  const mockUserErrorResponse = {
    ok: false,
    status: 401
  };
  
  (fetch as jest.Mock)
    .mockResolvedValueOnce(mockSigninResponse)
    .mockResolvedValueOnce(mockUserErrorResponse);

  await expect(loginUser({ email: 'test@test.com', password: 'pass123' }))
    .rejects.toThrow('Erro ao buscar dados do usuário')
})

})
