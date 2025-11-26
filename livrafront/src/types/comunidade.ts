export interface Comunidade {
    _id: string;
    nome: string;
    descricao?: string;
    moderadores: string[];
    membros: string[];
    posts: string[];
    capaUrl?: string;
    bannerUrl?: string;
    tags?: string[];
    slug?: string;
    createdAt: string; 
    updatedAt: string;
}

export interface CreateCommunityData {
    nome: string;
    descricao?: string;
    capaUrl?: string;
    bannerUrl?: string;
    tags?: string[];
    slug?: string;
}

export type UpdateCommunityData = Partial<CreateCommunityData>;

export const CommunityTags = [
    'romance',
    'aventura',
    'fantasia',
    'drama',
    'terror',
    'suspense',
    'comedia',
    'distopia',
]