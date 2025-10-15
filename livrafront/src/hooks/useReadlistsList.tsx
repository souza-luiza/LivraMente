import { useEffect, useState } from 'react';
import { Readlist } from '../types/readlist';

export function useReadlistsList(identifier: string, isUsername: boolean = false) {
  const [readlists, setReadlists] = useState<Readlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar readlists a partir do ID do usuário 
  useEffect(() => {
    setLoading(true);
    setError(null);
    let endpoint = '';
    if (isUsername) {
      endpoint = `/readlists/user/${identifier}`;
    } else {
      endpoint = `/readlists`;
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
  }, [identifier, isUsername]);

  return { readlists, loading, error };
}
