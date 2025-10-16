import { useCallback } from "react";
import { Readlist } from "../types/readlist";

const API_BASE_URL = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useCreateReadlist(userId: string) {
  // Atualiza a lista local após criar uma readlist
  const handleCreateReadlist = useCallback(async (data: { nome: string; descricao?: string; publica: boolean }, setError?: (msg: string) => void) => {
    if (!data.nome || !data.nome.trim()) {
      if (setError) setError('* Título é obrigatório');
      return;
    }
    try {
      const body = {
        ...data,
        criador: userId,
        livros: [],
        favorito: false,
      };
      const response = await fetch(`${API_BASE_URL}/readlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar readlist');
      }
      const result: Readlist = await response.json();
      alert(`Readlist criada: ${result.nome}`);
      if (setError) setError('');
    } catch (err: any) {
      if (setError) setError(err.message || 'Erro ao criar readlist');
      else alert(err.message || 'Erro ao criar readlist');
    }
  }, [userId]);

  return { handleCreateReadlist };
}
