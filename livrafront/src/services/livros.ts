import { Livro } from "@/types/livro"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const livrosService = {
    async getLivros() : Promise <Livro[]> {
        const response = await fetch(`${API_BASE_URL}/livros`);
        
        if(!response.ok) return Promise.reject(new Error('Erro ao buscar comunidades'));
        return response.json();
    }
}