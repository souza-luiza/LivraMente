export interface Comunidade {
    _id: string;
    nome: string;
    slug?: string;
    descricao?: string;
    moderadores: string[];
    membros: string[];
    posts: string[];
    imagem_url?: string;
    tags?: string[];
    createdAt: string; 
    updatedAt: string;
}