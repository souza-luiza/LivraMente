import { useCallback, useState } from "react";
import { Readlist } from "../types/readlist";
import { ZodError } from 'zod'
import { createReadlistSchema } from '@/lib/validations/create-readlist'
import { createReadlist as createReadlistService } from '@/services/readlists'

export function useCreateReadlist(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  // Atualiza a lista local após criar uma readlist
  const handleCreateReadlist = useCallback(async (data: { nome: string; descricao?: string; publica: boolean }, setError?: (msg: string) => void, addToList?: (rl: Readlist) => void) => {
    if (!data.nome || !data.nome.trim()) {
      if (setError) setError('* Título é obrigatório');
      return;
    }

    try {
      // Validação dos campos
      try {
        createReadlistSchema.parse({ titulo: data.nome, descricao: data.descricao, publica: data.publica });
      } catch (err: unknown) {
        if (err instanceof ZodError) {
          const msg = err.issues?.[0]?.message || 'Erro de validação';
          if (setError) setError(msg);
          return;
        }
      }
      setIsLoading(true);
      setApiError('');
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        publica: data.publica,
      };
      const result = await createReadlistService(payload);
      if (setError) setError('');
      if (addToList) addToList(result);
      return result;
    } catch (err: any) {
      const message = err?.message || 'Erro ao criar readlist';
      if (setError) setError(message);
      setApiError(message);
      return undefined as unknown as Readlist;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { handleCreateReadlist, isLoading, apiError, clearApiError: () => setApiError('') };
}
