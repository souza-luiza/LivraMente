export interface Livro {
  _id: string;
  titulo: string;
  slug: string;
  isbn: string;
  autores: string[];
  ano_publicacao: number;
  sinopse: string;
  numero_paginas: number;
  generos: string[];
  citacoes?: string[];
  editora?: string;
  capa_url: string;
  readlists?: string[];
  comunidades?: string[];
  resenhas?: string[];
  avaliacoes_count: number;
  avaliacoes_media: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}