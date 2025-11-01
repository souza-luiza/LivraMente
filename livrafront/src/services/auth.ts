/* Faz requisições HTTP para fazer login do usuário */

import { api } from '@/lib/api';
import { LoginFormData, LoginResponse } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  try {
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
    
    return {
      token: result.accessToken,
      user: { 
        _id: result.userId || result.user?.id || 'user-id', 
        username: result.username,
        email: data.email,
        avatarUrl: result.avatarUrl
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede')
  }
}

export const logoutUser = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const checkAuth = async () => {
  try {
    await api.get('/auth/verify');
    return true;
  } catch {
    return false;
  }
};