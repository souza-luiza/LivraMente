'use client';
import { useState, useEffect } from 'react';
import { useNotificationsStore } from '@/stores/notificacoesStore';
import Sidebar from '@/components/sidebar';
import NotificacaoList from '@/components/notificacao-list';
import Button from '@/components/button';
import SearchBar from '@/components/searchbar';
import CheckIcon from '@/components/icons/CheckIcon';
import { getSessionInfos } from '@/services/auth';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/loading';
import { getNotificacoes } from '@/services/mensageria';

export default function NotificacoesPage() {
    const router = useRouter();
    const { notificacoes, marcarComoLida, marcarTodasComoLidas, removerNotificacao, contarNaoLidas, definirNotificacoes } = useNotificationsStore();
    const [naoLidas, setNaoLidas] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const info = await getSessionInfos();
                if (!info) {
                    router.replace('/entrar');
                    return;
                }
                // Buscar notificações do backend
                const notificacoesDoBackend = await getNotificacoes();
                definirNotificacoes(notificacoesDoBackend);
            } catch (error) {
                router.replace('/entrar');
                return;
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router, definirNotificacoes]);

    useEffect(() => {
        setNaoLidas(contarNaoLidas());
    }, [notificacoes, contarNaoLidas]);

    return (
        <div className="flex min-h-screen h-screen m-0 bg-white">
            <Sidebar />
            {isLoading ? (
                    <LoadingPage />
            ) : (
            <div className="flex-1 flex flex-col">
                <SearchBar />
                <div className="flex-1 p-8 overflow-auto">
                    {/* Header */}
                    <div className="bg-white p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-h3 font-bold">Notificações</h1>
                                <p className="text-b2 mt-1" style={{ color: 'var(--primary-600)' }}>
                                    {naoLidas} não lida{naoLidas !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Button
                                text="Marcar todas como lidas"
                                icon= < CheckIcon />
                                size="small"
                                colorScheme="light-green"
                                onClick={() => marcarTodasComoLidas()}
                            />
                        </div>
                    </div>
                    {/* Lista de notificações */}
                    <NotificacaoList 
                        notificacoes={notificacoes}
                        onMarcarComoLida={marcarComoLida}
                        onRemover={removerNotificacao}
                    />
                </div>
            </div>
            )}
        </div>
    );
}