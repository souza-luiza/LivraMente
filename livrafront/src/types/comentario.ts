import { Post } from "./post";

export interface Comentario {
    _id: string;
    autor: {                                             
        _id: string;
        username: string;
        avatarUrl: string;
    };
    post: string | Post;
    conteudo: string;
    imagens: string[];
    curtidas: string[];
    mencoes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentData {
    conteudo: string;
    imagens: string[];
}

export type UpdateCommentData = Partial<CreateCommentData>;