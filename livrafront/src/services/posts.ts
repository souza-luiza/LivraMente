import { CreatePostData, Post, LikeResponse } from '@/types/post';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Erro ao processar requisição';
    throw new Error(errorMessage);
  }

  return data;
}


export const postsService = {

  async createPost(data: CreatePostData, token: string): Promise<Post> {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',                                 
      headers: {
        'Authorization': `Bearer ${token}`,            
        'Content-Type': 'application/json',            
      },
      body: JSON.stringify(data),                      
    });

    return handleResponse<Post>(response);
  },


  async getPostsByComunidade(comunidadeId: string, token: string): Promise<Post[]> {
    const url = `${API_URL}/posts/comunidade/${comunidadeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<Post[]>(response);
  },

  async getPostsByCategoria(
    comunidadeId: string,
    categoria: 'geral' | 'fanart' | 'fanfic',
    token: string
  ): Promise<Post[]> {
    const url = `${API_URL}/posts/comunidade/${comunidadeId}/categoria/${categoria}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<Post[]>(response);
  },


  async getPendentes(comunidadeId: string, token: string): Promise<Post[]> {
    const url = `${API_URL}/posts/comunidade/${comunidadeId}/pendentes`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<Post[]>(response);
  },


  async getPost(postId: string, token: string): Promise<Post> {
    const url = `${API_URL}/posts/${postId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<Post>(response);
  },


  async updatePost(
    postId: string,
    data: Partial<CreatePostData>,
    token: string
  ): Promise<Post> {
    const url = `${API_URL}/posts/${postId}`;

    const response = await fetch(url, {
      method: 'PATCH',                                
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),                     
    });

    return handleResponse<Post>(response);
  },


  async deletePost(postId: string, token: string): Promise<{ message: string }> {
    const url = `${API_URL}/posts/${postId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<{ message: string }>(response);
  },


  async curtirPost(postId: string, token: string): Promise<LikeResponse> {
    const url = `${API_URL}/posts/${postId}/curtir`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),                       
    });

    return handleResponse<LikeResponse>(response);
  },


  async moderarPost(
    postId: string,
    aprovar: boolean,
    categoria: 'geral' | 'fanart' | 'fanfic',
    token: string
  ): Promise<Post> {
    const url = `${API_URL}/posts/${postId}/moderar`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aprovar,                                       
        categoria,                                     
      }),
    });

    return handleResponse<Post>(response);
  },
};
