/* Interfaces de dados usadas para readlists */

/* Dados de um livro na readlist */
export interface Book {
  id: string
  title: string
  year: string
  pages: string
  rating: number
  cover: string
}

/* Dados da readlist */
export interface Readlist {
  _id: string
  nome: string
  favorito: boolean
  publica: boolean
  descricao?: string
  capa_url?: string
  criador: string
  livros: string[] // Array de IDs dos livros
  createdAt?: string
  updatedAt?: string
}

/* Dados para criar uma nova readlist */
export interface CreateReadlistData {
  nome: string
  favorito?: boolean
  publica?: boolean
  descricao?: string
  capa_url?: string
}

/* Dados para atualizar uma readlist */
export interface UpdateReadlistData {
  nome?: string
  favorito?: boolean
  publica?: boolean
  descricao?: string
  capa_url?: string
}

/* Resposta da API ao buscar readlists do usuário */
export interface UserReadlistsResponse {
  readlists: Readlist[]
}

/* Resposta da API ao buscar uma readlist específica */
export interface ReadlistDetailResponse extends Readlist {
  livros: Book[] // Quando buscar detalhes, os livros vêm populados
}
