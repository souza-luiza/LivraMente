'use client';
import { useNotificationsStore } from '@/store/notificacoesStore';
import Sidebar from '@/components/sidebar';
import NotificacaoList from '@/components/notificacao-list';
import Button from '@/components/button';
import SearchBar from '@/components/searchbar';
import CheckIcon from '@/components/icons/CheckIcon';

export default function NotificacoesPage() {
    const { notificacoes } = useNotificationsStore();

    return (
        <div className="flex min-h-screen h-screen m-0 bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <SearchBar />
                <div className="flex-1 p-8 overflow-auto">
                    {/* Header */}
                    <div className="bg-white p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <Button
                                text="Marcar todas como lidas"
                                icon= < CheckIcon />
                                size="small"
                                colorScheme="light-green"
                            />
                        </div>
                    </div>
                    {/* Lista de notificações */}
                    <NotificacaoList 
                        notificacoes={notificacoes}
                    />
                </div>
            </div>
        </div>
    );
}