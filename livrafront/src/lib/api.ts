import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { token, logout } = useAuthStore.getState();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Se token expirou ou é inválido
  if (response.status === 401) {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Token expirado. Faça login novamente.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return response;
}

// Helpers para métodos HTTP comuns
export const api = {
  get: async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint, { method: 'GET' });
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  put: async (endpoint: string, data?: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  patch: async (endpoint: string, data?: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint, { method: 'DELETE' });
    return response.json();
  },
};