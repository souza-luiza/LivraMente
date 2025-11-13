import { LoginFormData, User } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function loginUser(data: LoginFormData): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({
      email: data.email,
      senha: data.password
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Credenciais inválidas.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao fazer login.');
  }

  return await response.json();
}

export async function registerUser(username: string, email: string, senha: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({
      username,
      email,
      senha
    })
  });

  if(!response.ok) {
    if (response.status === 400) throw new Error('Credenciais em uso.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao fazer cadastro.');
  }

  return await response.json();
}

export async function getSessionInfos(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/session-info`, { 
    credentials: "include" 
  });
  if(!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao retornar informações do usuário.');
  }
  return await response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'DELETE',
    credentials: "include"
  });
  if(!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao deslogar usuário.');
  }
}