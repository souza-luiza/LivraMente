/* Dados de um livro populado na readlist */
export interface PopulatedBook {
  _id: string;
  titulo: string;
  isbn: string;
  autores: any[];
  ano_publicacao?: number;
  sinopse?: string;
  numero_paginas?: number;
  generos?: string[];
  editora?: string;
  capa_url?: string;
  avaliacoes_count?: number;
  avaliacoes_media?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* Dados da readlist */
export interface Readlist {
  _id: string;
  nome: string;
  favorito: boolean;
  publica: boolean;
  descricao?: string;
  capa_url?: string;
  criador: {
    _id: string;
    username?: string;
  };
  livros: Array<string | PopulatedBook>;
  contribuidores?: Array<{ _id: string; username?: string }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  favoritadoPor?: string[]; 
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
export interface ReadlistDetailResponse {
  _id: string
  nome: string
  favorito: boolean
  publica: boolean
  descricao?: string
  capa_url?: string
  criador: {
    _id: string
    username?: string
  }
  livros: PopulatedBook[] // Quando buscar detalhes, os livros vêm populados
  contribuidores?: Array<{ _id: string; username?: string }>
  createdAt?: string | Date
  updatedAt?: string | Date
  favoritadoPor?: string[]
}