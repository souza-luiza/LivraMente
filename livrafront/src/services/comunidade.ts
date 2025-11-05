import { Comunidade } from '@/types/comunidade';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

function getAuthHeaders(): { [key: string]: string } | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getComunidadeByName(comunidadeNome: string): Promise<Comunidade> {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error(`Erro ao buscar comunidade`);
  return res.json();
}

export async function getPosts(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/posts`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao buscar posts");
  return res.json();
}

export async function getMembers(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao buscar membros");
  return res.json();
}

export async function getModerators(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/moderadores`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao buscar moderadores");
  return res.json();
}

export async function checkMemberOrMod(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/verificar-membro/${encodeURIComponent(comunidadeNome)}`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao verificar membro/moderador");
  return res.json();
} 

export async function enterCommunity(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
    method: "PATCH",
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao entrar na comunidade");
  return res.json();
}

export async function leaveCommunity(comunidadeNome: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros`, {
    method: "DELETE",
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao sair da comunidade");
  return res.json();
}

export async function createCommunity(payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/comunidades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeaders() || {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao criar comunidade')
    return Promise.reject(new Error(text || 'Erro ao criar comunidade'))
  }

  return response.json()
}

export async function getCommunity(comunidadeNome: string) {
  const response = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao buscar comunidade')
    return Promise.reject(new Error(text || 'Erro ao buscar comunidade'))
  }
  return response.json()
}

export async function updateCommunity(comunidadeNome: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeaders() || {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao editar comunidade')
    return Promise.reject(new Error(text || 'Erro ao editar comunidade'))
  }

  return response.json()
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(getAuthHeaders() || {}),
    },
    body: formData,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao enviar imagem')
    return Promise.reject(new Error(text || 'Erro ao enviar imagem'))
  }
  const json = await response.json()
  return json.url || json.imagem_url || json.data || ''
}