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

export interface CreateCommunityData {
    nome: string;
    descricao?: string;
    imagem_url?: string;
    tags?: string[];
    slug?: string;
}

export type UpdateCommunityData = Partial<CreateCommunityData>;

export const CommunityTags = [
    'Romance',
    'Aventura',
    'Fantasia',
    'Drama',
    'Terror',
    'Suspense',
    'Comédia',
    'Distopia',
]