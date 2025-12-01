import { Livro } from "./livros";
import { Comentario } from "./comentario";

export interface Resenha {
    _id: string;
    autor: {                                             
        _id: string;
        username: string;
        avatarUrl: string;
    };
    livro: Livro;
    avaliacao: number;
    conteudo: string;
    spoiler: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    curtidas: string[];
    comentarios: Comentario[]; 
}