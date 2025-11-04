import { Readlist } from '../types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(required: boolean = false): { [key: string]: string } | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token && required) throw new Error('Token não encontrado');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

// Buscar readlists públicas de um usuário
export async function getPublicReadlists(username: string): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists/public/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeaders(false) || {}),
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return Promise.reject(new Error('Usuário não encontrado'));
    }
    return Promise.reject(new Error('Erro ao buscar readlists públicas'));
  }
  return response.json();
}

// Buscar readlists criadas pelo usuário autenticado
export async function getOwnReadlists(): Promise<Readlist[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/readlists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthHeaders(true) || {}),
      },
    });
    if (!response.ok) return Promise.reject(new Error('Erro ao buscar suas readlists'));
    const json = await response.json();
    return json;
  } catch (error) {
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(String(error)));
  }
}

// Buscar readlists favoritas do usuário autenticado
export async function getFavoriteReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar`, {
    headers: {
      ...(getAuthHeaders(true) || {}),
    },
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(false) || {}),
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(true) || {}),
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
      ...(getAuthHeaders(true) || {}),
    },
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao remover livro da readlist'));
  return response.json();
}