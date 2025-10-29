/* Faz requisições HTTP para gerenciar readlists do usuário */

import { 
  Readlist, 
  CreateReadlistData, 
  UpdateReadlistData, 
  ReadlistDetailResponse 
} from '@/types/readlist'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

/**
 * Busca todas as readlists do usuário autenticado
 * @returns Lista de readlists do usuário
 */
export async function getUserReadlists(): Promise<Readlist[]> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 500) {
        throw new Error('Erro interno do servidor')
      }
      throw new Error('Erro ao buscar readlists')
    }

    const readlists = await response.json()
    return readlists

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao buscar readlists')
  }
}

/**
 * Busca readlists públicas de um usuário específico pelo username
 * @param username - Nome de usuário
 * @returns Lista de readlists públicas do usuário
 */
export async function getPublicReadlists(username: string): Promise<Readlist[]> {
  try {
    const token = localStorage.getItem('token')
    
    console.log('🔍 getPublicReadlists:', { username, hasToken: !!token });
    
    // Readlists públicas não exigem autenticação, mas enviamos token se disponível
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/readlists/public/${username}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuário não encontrado')
      }
      throw new Error('Erro ao buscar readlists públicas')
    }

    const readlists = await response.json()
    return readlists

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao buscar readlists públicas')
  }
}

/**
 * Busca detalhes de uma readlist específica
 * @param readlistId - ID da readlist
 * @returns Detalhes completos da readlist com livros populados
 */
export async function getReadlistById(readlistId: string): Promise<ReadlistDetailResponse> {
  try {
    const token = localStorage.getItem('token')
    
    // Enviamos token se disponível (para acessar privadas também)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 404) {
        throw new Error('Readlist não encontrada')
      }
      if (response.status === 400) {
        throw new Error('ID inválido')
      }
      throw new Error('Erro ao buscar readlist')
    }

    const readlist = await response.json()
    return readlist

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao buscar readlist')
  }
}

/**
 * Cria uma nova readlist
 * @param data - Dados da nova readlist
 * @returns Readlist criada
 */
export async function createReadlist(data: CreateReadlistData): Promise<Readlist> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 400) {
        throw new Error('Dados inválidos')
      }
      throw new Error('Erro ao criar readlist')
    }

    const readlist = await response.json()
    return readlist

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao criar readlist')
  }
}

/**
 * Atualiza uma readlist existente
 * @param readlistId - ID da readlist
 * @param data - Dados para atualizar
 * @returns Readlist atualizada
 */
export async function updateReadlist(
  readlistId: string, 
  data: UpdateReadlistData
): Promise<Readlist> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 404) {
        throw new Error('Readlist não encontrada')
      }
      if (response.status === 400) {
        throw new Error('Dados inválidos')
      }
      throw new Error('Erro ao atualizar readlist')
    }

    const readlist = await response.json()
    return readlist

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao atualizar readlist')
  }
}

/**
 * Deleta uma readlist
 * @param readlistId - ID da readlist
 */
export async function deleteReadlist(readlistId: string): Promise<void> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 404) {
        throw new Error('Readlist não encontrada')
      }
      throw new Error('Erro ao deletar readlist')
    }

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao deletar readlist')
  }
}

/**
 * Adiciona um livro à readlist
 * @param readlistId - ID da readlist
 * @param livroId - ID do livro
 * @returns Readlist atualizada
 */
export async function addBookToReadlist(
  readlistId: string, 
  livroId: string
): Promise<Readlist> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 404) {
        throw new Error('Readlist ou livro não encontrado')
      }
      throw new Error('Erro ao adicionar livro à readlist')
    }

    const readlist = await response.json()
    return readlist

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao adicionar livro')
  }
}

/**
 * Remove um livro da readlist
 * @param readlistId - ID da readlist
 * @param livroId - ID do livro
 * @returns Readlist atualizada
 */
export async function removeBookFromReadlist(
  readlistId: string, 
  livroId: string
): Promise<Readlist> {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`${API_BASE_URL}/readlists/${readlistId}/livros/${livroId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      if (response.status === 404) {
        throw new Error('Readlist ou livro não encontrado')
      }
      throw new Error('Erro ao remover livro da readlist')
    }

    const readlist = await response.json()
    return readlist

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro de rede ao remover livro')
  }
}
