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
  const response = await fetch(`${API_BASE_URL}/notificacoes`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar notificações');
    }

    return await response.json();
}

//Marcar uma notificação específica como lida
export async function marcarNotificacaoComoLida(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notificacoes/${id}/lida`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar notificação como lida');
    }
} 

//Marcar todas as notificações como lidas
export async function marcarTodasComoLidas(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notificacoes/marcar-todas-lidas`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar todas as notificações como lidas');
    }
  }

//Remover uma notificação específica
export async function removerNotificacao(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notificacoes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao remover notificação');
    }
}