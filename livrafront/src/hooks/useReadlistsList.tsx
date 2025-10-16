import { useEffect, useState } from 'react';
import { Readlist } from '../types/readlist';

export function useReadlistsList(userId: string, type: 'criadas' | 'favoritadas' = 'criadas') {
  const [readlists, setReadlists] = useState<Readlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let endpoint = '';
    if (type === 'favoritadas') {
      endpoint = `/api/readlists/favorited/${userId}`;
    } else {
      endpoint = `/api/readlists/user/${userId}`;
    }
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReadlists(data);
        } else {
          setReadlists([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao buscar readlists do usuário.');
        setLoading(false);
      });
  }, [userId, type]);

  return { readlists, loading, error };
}
