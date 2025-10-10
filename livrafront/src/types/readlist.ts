export interface Readlist {
  _id?: string;
  nome: string;
  favorito?: boolean;
  publica?: boolean;
  descricao?: string;
  capa_url?: string;
  criador: string;
  livros: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
