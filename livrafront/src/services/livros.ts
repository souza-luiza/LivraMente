import { Readlist } from "@/types/readlist";
import { Livro } from "../types/livros";
import { Comunidade } from "@/types/comunidade";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const livrosService = {
    async getBooks(): Promise<Livro[]> {
        const res = await fetch(`${API_BASE_URL}/livros`);
        if (!res.ok) throw new Error('Erro ao buscar livros');
        return res.json();
    },

    async getBookBySlug(slug: string): Promise<Livro> {
        const res = await fetch(`${API_BASE_URL}/livros/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Erro ao buscar livro');
        return res.json();
    },

    async getBookReadlists(slug: string): Promise<Readlist[]> {
        const res = await fetch(`${API_BASE_URL}/livros/${encodeURIComponent(slug)}/readlists`);
        if (!res.ok) throw new Error('Erro ao buscar readlists do livro');
        return res.json();
    },

    async getBookCommunities(slug: string): Promise<Comunidade[]> {
        const res = await fetch(`${API_BASE_URL}/livros/${encodeURIComponent(slug)}/comunidades`);
        if (!res.ok) throw new Error('Erro ao buscar comunidades do livro');
        return res.json();
    },
}