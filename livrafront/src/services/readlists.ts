import { Readlist } from '../types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(): { [key: string]: string } | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

// Buscar readlists públicas de um usuário
export async function getPublicReadlists(userId: string): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists/public/${userId}`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar readlists públicas'));
  return response.json();
}

// Buscar readlists criadas pelo usuário autenticado
export async function getOwnReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar suas readlists'));
  const json = await response.json();
  return json;
}

// Buscar readlists favoritas do usuário autenticado
export async function getFavoriteReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar favoritas'));
  return response.json();
}

// Favoritar uma readlist pública
export async function favoriteReadlist(readlistId: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar/${readlistId}`, {
    method: 'PATCH',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao favoritar readlist'));
  return response.json();
}

// Remover readlist dos favoritos
export async function unfavoriteReadlist(readlistId: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar/${readlistId}`, {
    method: 'DELETE',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao remover dos favoritos'));
  return response.json();
}