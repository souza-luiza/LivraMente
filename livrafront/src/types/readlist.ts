import { Livro } from "./livro";

/* Dados da readlist */
export interface Readlist {
  _id: string;
  nome: string;
  publica: boolean;
  descricao?: string;
  capa_url?: string;
  criador: string;
  livros: Array<Livro>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  slug: string;
}

/* Readlists favoritas */
export interface FavoriteReadlist {
  _id: string;
  nome: string;
  publica: boolean;
  descricao?: string;
  capa_url?: string;
  criador: {
    username: string;
  }
  livros: Array<Livro>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  slug: string;
}