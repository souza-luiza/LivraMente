import { useCallback, useState } from "react";
import { Readlist } from "../types/readlist";
import { ZodError } from 'zod';
import { createReadlistSchema } from '@/lib/validations/create-readlist';
import { createReadlist as createReadlistService } from '@/services/readlists';

export function useCreateReadlist() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleCreateReadlist = useCallback(
    async (
      data: { nome: string; descricao?: string; publica: boolean },
      setError?: (msg: string) => void,
      addToList?: (rl: Readlist) => void
    ) => {
      if (!data.nome || !data.nome.trim()) {
        if (setError) setError('* Título é obrigatório');
        return;
      }

      try {
        // Validação dos campos
        try {
          createReadlistSchema.parse({
            titulo: data.nome,
            descricao: data.descricao,
            publica: data.publica,
          });
        } catch (err: unknown) {
          if (err instanceof ZodError) {
            const msg = err.issues?.[0]?.message || 'Erro de validação';
            if (setError) setError(msg);
            return;
          }
        }

        setIsLoading(true);
        setApiError('');
        
        const result = await createReadlistService(data.nome, data.descricao, data.publica);

        if (setError) setError('');
        if (addToList) addToList(result);

        return result;
      } catch (err: unknown) {
        let message = 'Erro ao criar readlist';

        if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }

        if (setError) setError(message);
        setApiError(message);
        return undefined as unknown as Readlist;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    handleCreateReadlist,
    isLoading,
    apiError,
    clearApiError: () => setApiError(''),
  };
}
