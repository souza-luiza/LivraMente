export interface Comunidade {
  _id: string;
  nome: string;
  descricao: string;
  moderadores: string[];  // User[] ?
  membros: string[];
  posts: unknown;           // mudar pra Post[] quando o modelo existir
  imagem_url: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}