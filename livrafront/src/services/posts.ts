import { CreatePostData, Post, LikeResponse } from '@/types/post';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  // Parseia o JSON da resposta (tanto sucesso quanto erro)
  const data = await response.json();

  // Se status NÃO está entre 200-299, é um erro
  if (!response.ok) {
    // Tenta extrair mensagem de erro da API
    const errorMessage = data.message || data.error || 'Erro ao processar requisição';
    throw new Error(errorMessage);
  }

  // Retorna os dados se foi sucesso
  return data;
}

// ============================================================================
// 🌐 POSTS SERVICE - MÉTODOS HTTP
// ============================================================================
export const postsService = {
  /**
   * ========================================================================
   * 📝 CREATE POST - Cria um novo post
   * ========================================================================
   * Método HTTP: POST
   * Endpoint: /posts
   * Autenticação: Requerida (JWT no header)
   * Body: CreatePostData
   */
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    // 1️⃣ Faz a requisição HTTP POST
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',                                  // Verbo HTTP
      headers: {
        'Authorization': `Bearer ${token}`,            // Token JWT para autenticação
        'Content-Type': 'application/json',            // Indica que enviamos JSON
      },
      body: JSON.stringify(data),                      // Converte objeto JS para JSON string
    });

    // 2️⃣ Processa resposta e retorna dados ou lança erro
    return handleResponse<Post>(response);
  },

  /**
   * ========================================================================
   * 📋 GET POSTS BY COMUNIDADE - Lista todos os posts de uma comunidade
   * ========================================================================
   * Método HTTP: GET
   * Endpoint: /posts/comunidade/:comunidadeId
   * Autenticação: Requerida
   */
  async getPostsByComunidade(comunidadeId: string, token: string): Promise<Post[]> {
    // 1️⃣ Monta a URL com o ID da comunidade
    const url = `${API_URL}/posts/comunidade/${comunidadeId}`;

    // 2️⃣ GET não precisa de body, apenas headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // 3️⃣ Retorna array de posts
    return handleResponse<Post[]>(response);
  },

  /**
   * ========================================================================
   * 🏷️ GET POSTS BY CATEGORIA - Filtra posts por categoria
   * ========================================================================
   * Método HTTP: GET
   * Endpoint: /posts/comunidade/:comunidadeId/categoria/:categoria
   * Autenticação: Requerida
   */
  async getPostsByCategoria(
    comunidadeId: string,
    categoria: 'geral' | 'fanart' | 'fanfic',
    token: string
  ): Promise<Post[]> {
    // 1️⃣ URL com 2 parâmetros: comunidadeId e categoria
    const url = `${API_URL}/posts/comunidade/${comunidadeId}/categoria/${categoria}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<Post[]>(response);
  },

  /**
   * ========================================================================
   * ⏳ GET PENDENTES - Lista posts aguardando moderação
   * ========================================================================
   * Método HTTP: GET
   * Endpoint: /posts/comunidade/:comunidadeId/pendentes
   * Autenticação: Requerida (apenas moderadores)
   */
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

  /**
   * ========================================================================
   * 🔍 GET POST - Busca um post específico por ID
   * ========================================================================
   * Método HTTP: GET
   * Endpoint: /posts/:postId
   * Autenticação: Requerida
   */
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

  /**
   * ========================================================================
   * ✏️ UPDATE POST - Atualiza campos de um post existente
   * ========================================================================
   * Método HTTP: PATCH
   * Endpoint: /posts/:postId
   * Autenticação: Requerida (apenas autor do post)
   * Body: Partial<CreatePostData> - apenas campos a atualizar
   * 
   * PATCH vs PUT:
   * - PATCH: atualiza apenas os campos enviados (atualização parcial)
   * - PUT: substitui o recurso inteiro (atualização completa)
   */
  async updatePost(
    postId: string,
    data: Partial<CreatePostData>,
    token: string
  ): Promise<Post> {
    const url = `${API_URL}/posts/${postId}`;

    const response = await fetch(url, {
      method: 'PATCH',                                 // Atualização PARCIAL
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),                      // Apenas campos a atualizar
    });

    return handleResponse<Post>(response);
  },

  /**
   * ========================================================================
   * 🗑️ DELETE POST - Remove um post permanentemente
   * ========================================================================
   * Método HTTP: DELETE
   * Endpoint: /posts/:postId
   * Autenticação: Requerida (apenas autor ou moderador)
   */
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

  /**
   * ========================================================================
   * ❤️ CURTIR POST - Adiciona ou remove curtida (toggle)
   * ========================================================================
   * Método HTTP: POST
   * Endpoint: /posts/:postId/curtir
   * Autenticação: Requerida
   * Body: {} (vazio, não precisa enviar dados)
   * 
   * Lógica:
   * - Se usuário JÁ curtiu → remove a curtida
   * - Se usuário NÃO curtiu → adiciona a curtida
   */
  async curtirPost(postId: string, token: string): Promise<LikeResponse> {
    const url = `${API_URL}/posts/${postId}/curtir`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),                        // Body vazio mas necessário para POST
    });

    return handleResponse<LikeResponse>(response);
  },

  /**
   * ========================================================================
   * 👮 MODERAR POST - Aprova ou rejeita post pendente
   * ========================================================================
   * Método HTTP: PATCH
   * Endpoint: /posts/:postId/moderar
   * Autenticação: Requerida (apenas moderadores)
   * Body: { aprovar: boolean, categoria: string }
   * 
   * Fluxo:
   * - Se aprovar=true → status vira 'publicado'
   * - Se aprovar=false → status vira 'rejeitado'
   */
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
        aprovar,                                       // true = aprovar, false = rejeitar
        categoria,                                     // categoria correta do post
      }),
    });

    return handleResponse<Post>(response);
  },
};
