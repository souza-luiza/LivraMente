export interface Resenha {
    _id: string;                                         
    autor: {                                             
        _id: string;
        username: string;
        avatarUrl: string;
    };
    // referência ao livro
    conteudo: string;
    curtidas: string[];
    comentarios: string[];
    spoilers: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}