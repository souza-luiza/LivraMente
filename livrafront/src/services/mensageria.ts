import { Notificacao } from '@/types/notificacao';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

//Buscar todas as notificações do usuário autenticado
export async function getNotificacoes(): Promise<Notificacao[]> {
  const response = await fetch(`${API_BASE_URL}/notificacoes`, {
    method: 'GET',
    credentials: 'include', 
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
    credentials: 'include', 
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
    credentials: 'include', 
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
    credentials: 'include', 
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Erro ao remover notificação');
  }
}

//Conectar ao servidor via SSE pra receber notificações em tempo real
export function conectarNotificacoes(
  onNotificacao: (notificacao: Notificacao) => void,
  onError?: (error: Event) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/notificacoes/stream`, {
    withCredentials: true
  });
    
  eventSource.onmessage = (event) => {
    try {
      const notificacao: Notificacao = JSON.parse(event.data);
      onNotificacao(notificacao);
    } catch (error) {
      if (onError) {
        onError(new Event('parse-error'));
      }
    }
  };

  eventSource.onerror = (error) => {
    onError?.(error);
  };

  return () => {
    eventSource.close();
  };
}