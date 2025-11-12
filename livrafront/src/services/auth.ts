/* Faz requisições HTTP para fazer login do usuário */

import { api } from '@/lib/api';
import { LoginFormData, User } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export async function loginUser(data: LoginFormData): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
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
      _id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      avatarUrl: result.user.avatarUrl
    }

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede')
  }
}

export async function logout() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

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