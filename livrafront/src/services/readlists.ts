import { FavoriteReadlist, Readlist } from '@/types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Buscar readlists públicas de um usuário
export async function getPublicReadlists(username: string): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists/public/${username}`, {
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar readlists do usuário.');
  }
  return await response.json();
}

// Buscar readlists criadas pelo usuário autenticado
export async function getOwnReadlists(): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar readlists do usuário.');
  }
  return await response.json();
}

// Buscar readlists favoritas do usuário autenticado
export async function getFavoriteReadlists(): Promise<FavoriteReadlist[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar`, {
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar readlists favoritadas do usuário.');
  }
  return response.json();
}

// Criar uma nova readlist para o usuário autenticado
export async function createReadlist(nome: string, descricao?: string, publica?: boolean): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    method: 'POST',
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      publica,
      descricao
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao criar readlist.');
  }

  return response.json();
}

// Favoritar uma readlist pública
export async function favoriteReadlist(username: string, readlistSlug: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar/${username}/${readlistSlug}`, {
    method: 'PATCH',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao favoritar readlist.');
  }
  return response.json();
}

// Remover readlist dos favoritos
export async function unfavoriteReadlist(username: string, readlistSlug: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar/${username}/${readlistSlug}`, {
    method: 'DELETE',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao desfavoritar readlist.');
  }
  return response.json();
}

export async function checkReadlistFav(readlistId: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/favoritar/${readlistId}`, {
    method: 'GET',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao verificar se readlist está favoritada.');
  }
  return response.json();
} 

// Buscar detalhes de uma readlist especifica do usuario autenticado por slug
export async function getReadlistBySlug(readlistSlug: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistSlug}`, {
    method: 'GET',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Readlist não encontrada.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar readlist.');
  }
  return response.json();
}

export async function getOnePublicReadlist(username: string, readlistSlug: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/public/${username}/${readlistSlug}`, {
    method: 'GET',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Readlist não encontrada.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar readlist.');
  }
  return response.json();
}

// Atualizar uma readlist existente
export async function updateReadlist(readlistSlug: string, payload: { nome?: string; publica?: boolean; descricao?: string; }): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistSlug}`, {
    method: 'PATCH',
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Readlist não encontrada.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao atualizar readlist.');
  }

  return response.json();
}

export async function updatePhoto(formDataUpload: FormData, slug: string): Promise<{ capa_url: string }> {
  const response = await fetch(`${API_BASE_URL}/readlists/avatar/${slug}`, {
    method: 'PUT',
    credentials: "include",
    body: formDataUpload
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  return response.json();
}

// Deletar uma readlist
export async function deleteReadlist(readlistSlug: string) {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistSlug}`, {
    method: 'DELETE',
    credentials: "include"
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Readlist não encontrada.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao deletar readlist.');
  }
  return response.json();
}

// Adicionar livros na readlist
export async function addBookToReadlist(readlistId: string, livroIds: string[]): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros`, {
    method: 'PATCH',
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livroIds })
  });

  if (!response.ok) {
    if (response.status === 404) return Promise.reject(new Error('Readlist não encontrada'));
    return Promise.reject(new Error('Erro ao adicionar livros à readlist'));
  }

  return response.json();
}

// Remover um livro da readlist
export async function removeBookFromReadlist(readlistId: string, livroId: string): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`, {
    method: 'DELETE',
    credentials: "include",
  });
  if (!response.ok) return Promise.reject(new Error('Erro ao remover livro da readlist'));
  return response.json();
}

// Adicionar livro em readlists
export async function addReadlistToBook(livroId: string, readlistIds: string[]): Promise<Readlist> {
  const response = await fetch(`${API_BASE_URL}/readlists/${livroId}`, {
    method: 'PATCH',
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readlistIds })
  });

  if (!response.ok) {
    if (response.status === 404) return Promise.reject(new Error('Livro não encontrado'));
    return Promise.reject(new Error('Erro ao adicionar livro nas readlists'));
  }

  return response.json();
}