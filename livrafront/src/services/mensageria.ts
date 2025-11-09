import { Notificacao } from '@/types/notificacao';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

//Buscar todas as notificações do usuário autenticado
export async function getNotificacoes(): Promise<Notificacao[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/notificacoes`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar notificações');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}