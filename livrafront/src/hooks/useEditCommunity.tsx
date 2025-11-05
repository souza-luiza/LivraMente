import { useCallback, useState } from 'react';
import { updateCommunity as updateCommunityService, uploadImage } from '@/services/comunidade';
import { titleToSlug } from '@/lib/slugify';

export function useEditCommunity() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleEditCommunity = useCallback(
    async (
      identifier: string,
      data: { nome?: string; descricao?: string; tags?: string[]; foto?: File | null },
      originalData?: { nome?: string; descricao?: string; tags?: string[] }
    ) => {
      if (!identifier) {
        setApiError('Identificador da comunidade ausente');
        return undefined;
      }

      setIsLoading(true);
      setApiError('');

      try {
        const payload: Record<string, unknown> = {};
        if (originalData) {
          if (data.nome && data.nome !== originalData.nome) {
            payload.nome = data.nome;
            payload.slug = titleToSlug(data.nome);
          }
          if (typeof data.descricao === 'string') {
            if (data.descricao && data.descricao.trim() !== '') payload.descricao = data.descricao;
          }
          if (data.tags && JSON.stringify(data.tags || []) !== JSON.stringify(originalData.tags || [])) payload.tags = data.tags;
        } else {
          if (data.nome) {
            payload.nome = data.nome;
            payload.slug = titleToSlug(data.nome);
          }
          if (data.descricao && data.descricao.trim() !== '') payload.descricao = data.descricao;
          if (data.tags) payload.tags = data.tags;
        }

        if (data.foto) {
          const imagem_url = await uploadImage(data.foto);
          if (imagem_url) payload.imagem_url = imagem_url;
        }

        if (Object.keys(payload).length === 0) {
          setApiError('Nenhuma alteração detectada.');
          return undefined;
        }

        const result = await updateCommunityService(identifier, payload);
        return result;
      } catch (err: unknown) {
        let message = 'Erro ao editar comunidade';
        if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string') {
          message = (err as any).message;
        }
        setApiError(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { handleEditCommunity, isLoading, apiError, clearApiError: () => setApiError('') };
}
