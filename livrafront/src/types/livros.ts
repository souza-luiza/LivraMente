export interface Livro {
    _id: string;
    titulo: string;
    slug: string;
    isbn: string;
    autores: Autor[];
    ano_publicacao: number;
    sinopse: string;
    numero_paginas: number;
    generos: string[];
    citacoes?: string[];
    editora?: string;
    capa_url: string;
    readlists?: string[];
    comunidades?: string[];
    resenhas?: string[];
    avaliacoes_count: number;
    avaliacoes_media: number;
}

export interface Autor {
    nome: string;
    foto_url?: string;
    livros?: string[];
}