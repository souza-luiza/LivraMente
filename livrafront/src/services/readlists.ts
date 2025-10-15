import { Readlist } from '../types/readlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getUserReadlists(userId: string): Promise<Readlist[]> {
  try {
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
  } catch (error) {
    return [
      {
        _id: '1',
        nome: 'Favoritos',
        favorito: true,
        publica: true,
        descricao: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        capa_url: '/kemi-teste.jpg',
        criador: { _id: userId, username: 'gatanoturna' },
        livros: ['livro1', 'livro2'],
        favoritadoPor: ['user1', 'user2', 'user3'],
        createdAt: '2025-10-01',
        updatedAt: '2025-10-02',
      }
    ];
  }
}