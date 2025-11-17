import { Comentario } from '@/types/comentario';
import { CreatePostData, Post, LikeResponse, PostCategoria, ModeratePostResponse } from '@/types/post';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

function getAuthHeaders(): { [key: string]: string } | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export const postsService = {

  // Criar novo post
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',                                 
      headers: {
        ...(getAuthHeaders() || {}),
        'Content-Type': 'application/json',            
      },
      body: JSON.stringify(data),                      
    });

    if (!response.ok) throw new Error(`Erro ao criar post`);
    return response.json();
  },

  // Curtir post
  async likePost(postId: string): Promise<LikeResponse> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/curtir`, {
      method: 'POST',
      headers: {
        ...(getAuthHeaders() || {}),
      },
    });

    if (!response.ok) throw new Error(`Erro ao curtir/descurtir post`);
    return response.json();
  },

  // Excluir post
  async removePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/excluir`, {
      method: 'DELETE',
      headers: {
        ...(getAuthHeaders() || {}),
      },
    });

    if (!response.ok) throw new Error(`Erro ao excluir post`);
    return response.json();
  },

  // Editar post
  async updatePost(postId: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/editar`, {
      method: 'PATCH',
      headers: {
        ...(getAuthHeaders() || {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Erro ao editar post`);
    return response.json();
  },

  // Moderar post
  async moderatePost(postId: string, aprovar: boolean, categoria: PostCategoria): Promise<ModeratePostResponse> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/moderar`, {
      method: 'PATCH',
      headers: {
        ...(getAuthHeaders() || {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aprovar, categoria }),
    });

    if (!response.ok) throw new Error(`Erro ao moderar post`);
    return response.json();
  },

  async getPostById(postId: string, communityName: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comunidade/${encodeURIComponent(communityName)}`, {
      headers: {
        ...(getAuthHeaders() || {}),
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Erro ao encontrar post');
    return response.json();
  },

  async getComments(postId: string): Promise<Comentario[]> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
      headers: {
        ...(getAuthHeaders() || {})
      }
    });

    if (!response.ok) throw new Error('Erro ao encontrar comentários');
    return response.json();
  }
};