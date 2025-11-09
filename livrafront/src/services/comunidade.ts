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

export async function removeMember(comunidadeNome: string, targetUserId: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros/${encodeURIComponent(targetUserId)}`, {
    method: "DELETE",
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao remover membro como moderador");
  return res.json();
}

export async function makeMemberModerator(comunidadeNome: string, targetUserId: string) {
  const res = await fetch(`${API_BASE_URL}/comunidades/${encodeURIComponent(comunidadeNome)}/membros/${encodeURIComponent(targetUserId)}/tornar-moderador`, {
    method: "PATCH",
    headers: {
      ...(getAuthHeaders() || {}),
    },
  });
  if (!res.ok) throw new Error("Erro ao promover membro a moderador");
  return res.json();
}