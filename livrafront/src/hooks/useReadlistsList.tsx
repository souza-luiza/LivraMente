import { useEffect, useState } from 'react';
import { Readlist } from '../types/readlist';
import { getUserReadlists } from '../services/readlists';

export function useReadlistsList(userId: string) {
  // Estado para armazenar as readlists do usuário
  const [readlists, setReadlists] = useState<Readlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar readlists a partir do ID do usuário 
  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserReadlists(userId)
      .then(setReadlists)
      .catch((err) => setError(err.message || 'Erro ao buscar readlists'))
      .finally(() => setLoading(false));
  }, [userId]);

  return { readlists, loading, error };
}
