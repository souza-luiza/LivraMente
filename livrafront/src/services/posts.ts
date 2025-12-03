import { Comentario } from '@/types/comentario';
import { CreatePostData, Post, LikeResponse, PostCategoria, ModeratePostResponse, UpdatePostData } from '@/types/post';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const postsService = {

  // Criar novo post
  async createPost(data: CreatePostData): Promise<Post> {
    const formData = new FormData();

    formData.append("conteudo", data.conteudo);
    formData.append("comunidade", data.comunidade);

    if (data.solicitacao_revisao)
      formData.append("solicitacao_revisao", String(data.solicitacao_revisao));

    if (data.categoria)
      formData.append("categoria", data.categoria);

    if (data.publico !== undefined)
      formData.append("publico", String(data.publico));

    if (data.livro_referenciado && data.livro_referenciado.trim() !== "")
      formData.append("livro_referenciado", data.livro_referenciado);

    if (data.tags)
      data.tags.forEach(tag => formData.append("tags", tag));

    if (data.imagens)
      data.imagens.forEach((file) => formData.append("imagens", file));
    
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      credentials: "include",                            
      body: formData,                      
    });

    if (!response.ok) throw new Error(`Erro ao criar post`);
    return response.json();
  },

  // Curtir post
  async likePost(postId: string): Promise<LikeResponse> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/curtir`, {
      method: 'POST',
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Erro ao curtir/descurtir post`);
    return response.json();
  },

  // Excluir post
  async removePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/excluir`, {
      method: 'DELETE',
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Erro ao excluir post`);
    return response.json();
  },

  // Editar post
  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/editar`, {
      method: 'PATCH',
      credentials: "include",
      headers: {
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
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aprovar, categoria }),
    });

    if (!response.ok) throw new Error(`Erro ao moderar post`);
    return response.json();
  },

  async getPostById(postId: string, communityName: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comunidade/${encodeURIComponent(communityName)}`, {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Erro ao encontrar post');
    return response.json();
  },

  async getComments(postId: string): Promise<Comentario[]> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error('Erro ao encontrar comentários');
    return response.json();
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/posts/usuario/${encodeURIComponent(userId)}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error('Erro ao encontrar postagens do usuário');
    return response.json();
  }
};