import { useEffect, useState, useCallback } from 'react';
import { Readlist } from '../types/readlist';
import {
  getPublicReadlists,
  getOwnReadlists,
  getFavoriteReadlists
} from '../services/readlists';

export function useReadlistsList(userId: string, type: 'criadas' | 'favoritadas' = 'criadas') {
  const [readlists, setReadlists] = useState<Readlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadlists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Readlist[] = [];
      const loggedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (userId === loggedUserId) {
        if (type === 'favoritadas') {
          data = await getFavoriteReadlists();
        } else {
          data = await getOwnReadlists();
        }
      } else {
        data = await getPublicReadlists(userId);
      }
      setReadlists(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: any) {
      let msg = err?.message || 'Erro ao buscar readlists do usuário.';
      if (msg === 'Failed to fetch') {
        msg = 'Não foi possível conectar ao servidor.';
      }
      setError(msg);
      setReadlists([]);
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchReadlists();
    return undefined;
  }, [fetchReadlists]);

  return { readlists, loading, error, refetch: fetchReadlists };
}
