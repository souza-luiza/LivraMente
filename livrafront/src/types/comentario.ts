import { Post } from "./post";
import { Imagens } from "./post";

export interface Comentario {
    _id: string;
    autor: {                                             
        _id: string;
        username: string;
        avatarUrl: string;
    };
    post: string | Post;
    conteudo: string;
    imagens: Imagens[];
    curtidas: string[];
    mencoes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentData {
    conteudo: string;
    imagens: File[];
}

export type UpdateCommentData = Partial<CreateCommentData>;