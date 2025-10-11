import { Readlist } from '../types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getUserReadlists(userId: string): Promise<Readlist[]> {
  const response = await fetch(`${API_BASE_URL}/readlists/user/${userId}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Não autorizado');
    }
    if (response.status === 500) {
      throw new Error('Erro interno do servidor');
    }
    throw new Error('Erro na requisição');
  }
  const result = await response.json();
  return result as Readlist[];
}