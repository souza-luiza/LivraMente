import { Resenha } from "../types/resenha";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const resenhasService = {

  // Listar resenhas de um livro
  async getResenhasByBook(bookId: string): Promise<Resenha[]> {
    const response = await fetch(`${API_BASE_URL}/resenhas/${bookId}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar resenhas do livro.");
    return response.json();
  },

  // Criar nova resenha para um livro
  async createResenha(bookId: string, data: {
    conteudo: string;
    avaliacao: number;
    spoiler: boolean;
  }): Promise<Resenha> {
    const response = await fetch(`${API_BASE_URL}/resenhas/${bookId}`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar resenha.");
    return response.json();
  },

  // Editar resenha
  async updateResenha(resenhaId: string, data: {
    conteudo?: string;
    avaliacao?: number;
    spoiler?: boolean;
  }): Promise<Resenha> {
    const response = await fetch(`${API_BASE_URL}/resenhas/${resenhaId}`, {
      method: 'PATCH',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao editar resenha.");
    return response.json();
  },

  // Excluir resenha
  async removeResenha(resenhaId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/resenhas/${resenhaId}`, {
      method: 'DELETE',
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao excluir resenha.");
    return response.json();
  },
};