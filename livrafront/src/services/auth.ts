/* Faz requisições HTTP para fazer login do usuário */

import { LoginFormData, LoginResponse } from '@/types/auth'

export async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Se a autenticação tiver sucesso, retorna token e dados do usuário
  if (data.email === 'test@test.com' && data.password === '123456') {
    return {
      token: 'fake-token',
      user: { 
        id: '1', 
        email: data.email, 
        username: 'usuarioteste'
      }
    }
  }
  throw new Error('Informações de login inválidas')
}