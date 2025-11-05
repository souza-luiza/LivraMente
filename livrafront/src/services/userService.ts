import { api } from '@/lib/api';

export interface UserProfile {
  username: string;
  email: string;
  pronouns?: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
}

export const userService = {
  async getProfile(username: string): Promise<UserProfile> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/users/public/${username}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar perfil do usuário');
    }
    
    return response.json();
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Envia apenas os campos aceitos pelo backend
    const { username, pronouns, email } = data;
    const response = await api.put('/users/profile', {
      username,
      pronouns,
      email
    });
    
    // Verifica se response.data existe
    if (!response.data) {
      // Se o backend retornar diretamente sem wrapper 'data'
      return response as unknown as UserProfile;
    }
    
    return response.data;
  },

  async updateAvatar(file: Blob, token: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, 'avatar.jpg');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }

    return response.json();
  }
};