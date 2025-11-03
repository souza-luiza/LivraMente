import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreatePostData {
  conteudo: string;
  comunidade: string;
  imagens?: string[];
  solicitacao_revisao?: boolean;
  categoria?: 'geral' | 'fanart' | 'fanfic';
  tags?: string[];
  livro_referenciado?: string;
  publico?: boolean;
}

export interface Post {
  _id: string;
  autor: {
    _id: string;
    username: string;
    foto_perfil?: string;
  };
  conteudo: string;
  comunidade: string | {
    _id: string;
    nome: string;
  };
  categoria: 'geral' | 'fanart' | 'fanfic';
  status: 'publicado' | 'pendente_moderacao' | 'rejeitado';
  imagens: string[];
  tags: string[];
  curtidas: string[];
  comentarios: any[];
  publico: boolean;
  data_criacao: string;
  data_atualizacao: string;
  livro_referenciado?: string;
  solicitacao_revisao: boolean;
}

export interface LikeResponse {
  message: string;
  totalCurtidas: number;
  jaCurtiu: boolean;
}

export const postsService = {
  /**
   * Cria um novo post
   * @param data Dados do post
   * @param token JWT token
   * @returns Post criado
   */
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    const response = await axios.post(`${API_URL}/posts`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Lista todos os posts de uma comunidade
   * @param comunidadeId ID da comunidade
   * @param token JWT token
   * @returns Lista de posts
   */
  async getPostsByComunidade(comunidadeId: string, token: string): Promise<Post[]> {
    const response = await axios.get(
      `${API_URL}/posts/comunidade/${comunidadeId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Lista posts filtrados por categoria
   * @param comunidadeId ID da comunidade
   * @param categoria Categoria do post
   * @param token JWT token
   * @returns Lista de posts filtrados
   */
  async getPostsByCategoria(
    comunidadeId: string,
    categoria: 'geral' | 'fanart' | 'fanfic',
    token: string
  ): Promise<Post[]> {
    const response = await axios.get(
      `${API_URL}/posts/comunidade/${comunidadeId}/categoria/${categoria}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Lista posts pendentes de moderação (apenas para moderadores)
   * @param comunidadeId ID da comunidade
   * @param token JWT token
   * @returns Lista de posts pendentes
   */
  async getPendentes(comunidadeId: string, token: string): Promise<Post[]> {
    const response = await axios.get(
      `${API_URL}/posts/comunidade/${comunidadeId}/pendentes`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Busca um post específico
   * @param postId ID do post
   * @param token JWT token
   * @returns Post
   */
  async getPost(postId: string, token: string): Promise<Post> {
    const response = await axios.get(`${API_URL}/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Atualiza um post
   * @param postId ID do post
   * @param data Dados a atualizar
   * @param token JWT token
   * @returns Post atualizado
   */
  async updatePost(
    postId: string,
    data: Partial<CreatePostData>,
    token: string
  ): Promise<Post> {
    const response = await axios.patch(`${API_URL}/posts/${postId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Deleta um post
   * @param postId ID do post
   * @param token JWT token
   * @returns Mensagem de sucesso
   */
  async deletePost(postId: string, token: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Curte ou descurte um post
   * @param postId ID do post
   * @param token JWT token
   * @returns Resposta com status de curtida
   */
  async curtirPost(postId: string, token: string): Promise<LikeResponse> {
    const response = await axios.post(
      `${API_URL}/posts/${postId}/curtir`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Modera um post pendente (apenas moderadores)
   * @param postId ID do post
   * @param aprovar true para aprovar, false para rejeitar
   * @param categoria Categoria aprovada
   * @param token JWT token
   * @returns Post moderado
   */
  async moderarPost(
    postId: string,
    aprovar: boolean,
    categoria: 'geral' | 'fanart' | 'fanfic',
    token: string
  ): Promise<Post> {
    const response = await axios.patch(
      `${API_URL}/posts/${postId}/moderar?aprovar=${aprovar}&categoria=${categoria}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
