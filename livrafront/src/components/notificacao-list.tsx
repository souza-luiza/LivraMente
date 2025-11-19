import NotificacaoItem from './notificacao-item';
import { Notificacao } from '@/types/notificacao';

interface NotificacaoListProps {
    notificacoes: Notificacao[];
    onMarcarComoLida?: (id: string) => void;
    onRemover?: (id: string) => void;
}

export default function NotificacaoList({
    notificacoes,
    onMarcarComoLida,
    onRemover
}: NotificacaoListProps) {
    
    if (notificacoes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px] p-8">
                <p className="text-b1">Nenhuma notificação a ser exibida.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {notificacoes.map((notificacao) => (
                <NotificacaoItem
                    key={notificacao.id}
                    notificacao={notificacao}
                    onMarcarComoLida={onMarcarComoLida}
                    onRemover={onRemover}
                />
            ))}
        </div>
    );
}