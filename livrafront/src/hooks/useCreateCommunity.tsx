import { useCallback, useState } from 'react';
import { createCommunity as createCommunityService, uploadImage } from '@/services/comunidade';
import { titleToSlug } from '@/lib/slugify';

export function useCreateCommunity() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleCreateCommunity = useCallback(
    async (
      data: { nome: string; descricao?: string; tags: string[]; foto?: File | null },
      setError?: (msg: string) => void
    ) => {
      if (!data.nome || !data.nome.trim()) {
        if (setError) setError('O nome é obrigatório.');
        return;
      }
      if (!data.tags || data.tags.length === 0) {
        if (setError) setError('As tags são obrigatórias.');
        return;
      }

      setIsLoading(true);
      setApiError('');

      try {
        let imagem_url: string | undefined = undefined;
        if (data.foto) {
          imagem_url = await uploadImage(data.foto);
        }

        const payload: Record<string, unknown> = {
          nome: data.nome,
          tags: data.tags,
          slug: titleToSlug(data.nome),
        };
        if (imagem_url) payload.imagem_url = imagem_url;
        else if (!data.foto) payload.imagem_url = undefined;
        if (data.descricao && data.descricao.trim() !== '') payload.descricao = data.descricao;

        const result = await createCommunityService(payload);
        if (setError) setError('');
        return result;
      } catch (err: unknown) {
        let message = 'Erro ao criar comunidade';
        if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string') {
          message = (err as any).message;
        }
        if (setError) setError(message);
        setApiError(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { handleCreateCommunity, isLoading, apiError, clearApiError: () => setApiError('') };
}
