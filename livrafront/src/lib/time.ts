import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getTimeAgo(createdAt: string): string {
  return formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ptBR,
  });
}