import { useCallback, useState } from "react";
import { Readlist } from "../types/readlist";
import { ZodError } from 'zod'
import { createReadlistSchema } from '@/lib/validations/create-readlist'

const API_BASE_URL = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useCreateReadlist(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  // Atualiza a lista local após criar uma readlist
  const handleCreateReadlist = useCallback(
    async (
      data: { nome: string; descricao?: string; publica: boolean },
      setError?: (msg: string) => void,
      addToList?: (readlist: Readlist) => void
    ) => {
      // Validação com Zod
      try {
        createReadlistSchema.parse({
          titulo: data.nome,
          descricao: data.descricao,
          publica: data.publica,
        });
      } catch (err: unknown) {
        if (err instanceof ZodError) {
          // ZodError exposes `issues` which contains details about validation failures
          const msg = err.issues?.[0]?.message || 'Erro de validação';
          if (setError) setError(msg);
          return;
        }
      }
      try {
        setIsLoading(true);
        setApiError('');
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
          const text = await response.text().catch(() => 'Erro ao criar readlist');
          throw new Error(text || 'Erro ao criar readlist');
        }
  const result: Readlist = await response.json();
  setApiError('');
  if (setError) setError('');
  if (addToList) addToList(result);
  return result;
      } catch (err: any) {
  const message = err?.message || 'Erro ao criar readlist';
  if (setError) setError(message);
  setApiError(message);
  return undefined as unknown as Readlist;
      }
      finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return { handleCreateReadlist, isLoading, apiError, clearApiError: () => setApiError('') };
}
