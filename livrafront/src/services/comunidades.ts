import { Comunidade } from "@/types/comunidade";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getComunidades() : Promise<Comunidade[]> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/comunidades`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}`} : {})
        }
    });

    if(!response.ok) return Promise.reject(new Error('Erro ao buscar comunidades'));
    return await response.json();
}