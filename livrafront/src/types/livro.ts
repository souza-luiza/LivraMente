export interface Livro {
  _id: string;
  titulo: string;
  isbn: string;
  autores: string[];
  ano_publicacao: number;
  sinopse: string;
  numero_paginas: number;
  generos: string[];
  editora: string;
  capa_url?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}