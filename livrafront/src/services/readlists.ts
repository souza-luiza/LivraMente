import { Readlist } from '../types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(): { [key: string]: string } | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Buscar o token do storage do Zustand
  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) return undefined;
  
  try {
    const { state } = JSON.parse(authStorage);
    const token = state?.token;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  } catch {
    return undefined;
  }
}

// Buscar readlists públicas de um usuário
export async function getPublicReadlists(username: string): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists/public/${username}`, {
    credentials: "include",
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar readlists públicas'));
  return response.json();
}

// Buscar readlists criadas pelo usuário autenticado
export async function getOwnReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    credentials: "include",
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar suas readlists'));
  const json = await response.json();
  return json;
}

// Buscar readlists favoritas do usuário autenticado
export async function getFavoriteReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar`, {
    credentials: "include",
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao buscar favoritas'));
  return response.json();
}

// Criar uma nova readlist para o usuário autenticado
export async function createReadlist(payload: { nome: string; descricao?: string; publica: boolean }): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao criar readlist');
    return Promise.reject(new Error(text || 'Erro ao criar readlist'));
  }

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

// Buscar detalhes de uma readlist específica por ID
export async function getReadlistById(readlistId: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
    method: 'GET',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return Promise.reject(new Error('Readlist não encontrada'));
    }
    if (response.status === 400) {
      return Promise.reject(new Error('ID inválido'));
    }
    return Promise.reject(new Error('Erro ao buscar readlist'));
  }
  return response.json();
}

// Atualizar uma readlist existente
export async function updateReadlist(
  readlistId: string,
  payload: { nome?: string; descricao?: string; capa_url?: string; publica?: boolean }
): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return Promise.reject(new Error('Readlist não encontrada'));
    }
    return Promise.reject(new Error('Erro ao atualizar readlist'));
  }

  return response.json();
}

// Deletar uma readlist
export async function deleteReadlist(readlistId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
    method: 'DELETE',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return Promise.reject(new Error('Readlist não encontrada'));
    }
    return Promise.reject(new Error('Erro ao deletar readlist'));
  }
}

// Adicionar um livro à readlist
export async function addBookToReadlist(readlistId: string, livroId: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`, {
    method: 'PATCH',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return Promise.reject(new Error('Readlist ou livro não encontrado'));
    }
    return Promise.reject(new Error('Erro ao adicionar livro à readlist'));
  }
  return response.json();
}

// Remover um livro da readlist
export async function removeBookFromReadlist(readlistId: string, livroId: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`, {
    method: 'DELETE',
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao remover livro da readlist'));
  return response.json();
}