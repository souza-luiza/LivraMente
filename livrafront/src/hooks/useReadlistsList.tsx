import { useEffect, useState, useCallback } from 'react';
import { FavoriteReadlist, Readlist } from '../types/readlist';
import {
  getPublicReadlists,
  getOwnReadlists,
  getFavoriteReadlists
} from '../services/readlists';

export function useReadlistsList(
  target: string,
  type: 'criadas' | 'favoritadas' = 'criadas'
) {
  const [readlists, setReadlists] = useState<Readlist[] | FavoriteReadlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadlists = useCallback(async () => {
    if (!target) {
      setReadlists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: Readlist[] | FavoriteReadlist[] = [];
      const loggedUserId =
        typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (target === loggedUserId) {
        if (type === 'favoritadas') {
          data = await getFavoriteReadlists();
        } else {
          data = await getOwnReadlists();
        }
      } else {
        data = await getPublicReadlists(target);
      }

      setReadlists(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: unknown) {
      let msg = 'Erro ao buscar readlists do usuário.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        msg = (err as { message: string }).message;
      }

      if (msg === 'Failed to fetch') {
        msg = 'Não foi possível conectar ao servidor.';
      }

      setError(msg);
      setReadlists([]);
      setLoading(false);
    }
  }, [target, type]);

  useEffect(() => {
    fetchReadlists();
  }, [fetchReadlists]);

  return { readlists, loading, error, refetch: fetchReadlists };
}