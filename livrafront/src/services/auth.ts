/* Faz requisições HTTP para fazer login do usuário */

import { LoginFormData, LoginResponse } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  try {
    // Fazer requisição POST para o endpoint de login
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        senha: data.password  
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciais inválidas')
      }
      if (response.status === 500) {
        throw new Error('Erro interno do servidor')
      }
      throw new Error('Erro na requisição')
    }

    const result = await response.json()
    
    // Backend retorna token
    return {
      token: result.accessToken,
      user: { 
        id: 'user-id', 
        username: result.username,
        email: data.email 
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede')
  }
}