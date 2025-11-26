export interface Avaliacao {
    _id: string;
    autor: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    // referência ao livro
    nota: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}