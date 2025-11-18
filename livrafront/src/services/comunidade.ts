import { Comunidade } from '@/types/comunidade';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const communityService = {
  async getComunidadeByName(comunidadeNome: string): Promise<Comunidade> {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Erro ao buscar comunidade`);
    return res.json();
  },

  async getComunidades() : Promise<Comunidade[]> {
    const res = await fetch(`${API_BASE_URL}/comunidades`, {
      credentials: "include",
    });

    if(!res.ok) return Promise.reject(new Error('Erro ao buscar comunidades'));
    return await res.json();
  },

  async getPosts(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/posts`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao buscar posts");
    return res.json();
  },

  async getMembers(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao buscar membros");
    return res.json();
  },

  async getModerators(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/moderadores`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao buscar moderadores");
    return res.json();
  },

  async checkMemberOrMod(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/verificar-membro/${encodeURIComponent(comunidadeNome)}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao verificar membro/moderador");
    return res.json();
  },

  async enterCommunity(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao entrar na comunidade");
    return res.json();
  },

  async leaveCommunity(comunidadeNome: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao sair da comunidade");
    return res.json();
  },

  async removeMember(comunidadeNome: string, targetUserId: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros/${encodeURIComponent(targetUserId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao remover membro como moderador");
    return res.json();
  },

  async makeMemberModerator(comunidadeNome: string, targetUserId: string) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros/${encodeURIComponent(targetUserId)}/tornar-moderador`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erro ao promover membro a moderador");
    return res.json();
  },

  async createCommunity(payload: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/comunidades`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Erro ao criar comunidade')
      return Promise.reject(new Error(text || 'Erro ao criar comunidade'))
    }

    return response.json()
  },

  async getCommunity(comunidadeNome: string) {
    const response = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
      credentials: "include",
    })
    if (!response.ok) {
      const text = await response.text().catch(() => 'Erro ao buscar comunidade')
      return Promise.reject(new Error(text || 'Erro ao buscar comunidade'))
    }
    return response.json()
  },

  async updateCommunity(comunidadeNome: string, payload: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
      method: 'PATCH',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Erro ao editar comunidade')
      return Promise.reject(new Error(text || 'Erro ao editar comunidade'))
    }

    return response.json()
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      credentials: "include",
      body: formData,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => 'Erro ao enviar imagem')
      return Promise.reject(new Error(text || 'Erro ao enviar imagem'))
    }
    const json = await response.json()
    return json.url || json.imagem_url || json.data || ''
  },

  async deleteCommunity(comunidadeNome: string) {
    const response = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
      method: 'DELETE',
      credentials: "include",
    })
    if (!response.ok) throw new Error('Erro ao apagar comunidade')
    return response.json();
  }
}