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
  livros: Array<string | { _id: string; nome?: string }>;
  contribuidores?: Array<{ _id: string; username?: string }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  favoritadoPor?: string[]; 
}