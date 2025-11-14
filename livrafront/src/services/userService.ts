import { UserProfile } from '@/types/users';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getProfile(username: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/${username}`, {
    credentials: "include"
  });
  
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Usuário não encontrado.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao buscar informações do usuário.');
  }
  
  return await response.json();
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const { username, pronouns, email } = data;
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({
      username,
      email,
      pronouns
    })
  });
  
  if (!response.ok) {
    if (response.status === 401) throw new Error('Usuário não autenticado.');
    if (response.status === 404) throw new Error('Usuário não encontrado.');
    if (response.status === 409) throw new Error('Nome de usuário ou email em uso.');
    if (response.status === 500) throw new Error('Erro interno do servidor.');
    throw new Error('Erro ao atualizar dados do usuário.');
  }

  return await response.json();
}

export async function updateAvatar(formDataUpload: FormData): Promise<{ avatarUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/users/avatar`, {
    method: 'PUT',
    credentials: "include",
    body: formDataUpload
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  return response.json();
}
