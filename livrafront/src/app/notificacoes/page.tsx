'use client';
import { useState, useEffect } from 'react';
import { useNotificationsStore } from '@/stores/notificacoesStore';
import Sidebar from '@/components/sidebar';
import NotificacaoList from '@/components/notificacao-list';
import Button from '@/components/button';
import SearchBar from '@/components/searchbar';
import CheckIcon from '@/components/icons/CheckIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import { getSessionInfos } from '@/services/auth';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/loading';
import { getNotificacoes } from '@/services/mensageria';
import { toast } from 'react-toastify';
import ToastNotification from '@/components/toast-notification';

export default function NotificacoesPage() {
    const router = useRouter();
    const { notificacoes, marcarComoLida: marcarComoLidaLocal, marcarTodasComoLidas: marcarTodasComoLidasLocal, removerNotificacao: removerNotificacaoLocal, contarNaoLidas, definirNotificacoes } = useNotificationsStore();
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
                try {
                    const notificacoesDoBackend = await getNotificacoes();
                    definirNotificacoes(notificacoesDoBackend);
                } catch (error) {
                    toast.error('Erro ao carregar notificações. Tente novamente.');
                    definirNotificacoes([]);
                }
            } catch (error) {
                toast.error('Erro de autenticação.');
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

    const handleMarcarComoLida = async (id: string) => {
        try {
            const { marcarNotificacaoComoLida } = await import('@/services/mensageria');
            await marcarNotificacaoComoLida(id);
            marcarComoLidaLocal(id);
        } catch (error) {
            toast.error('Erro ao marcar notificação como lida.');
        }
    };

    const handleMarcarTodasComoLidas = async () => {
        try {
            const { marcarTodasComoLidas } = await import('@/services/mensageria');
            await marcarTodasComoLidas();
            marcarTodasComoLidasLocal();
            toast.success('Todas as notificações foram marcadas como lidas.');
        } catch (error) {
            toast.error('Erro ao marcar todas como lidas.');
        }
    };

    const handleRemoverTodasNotificacoes = async () => {
        try {
            const { removerTodasNotificacoes } = await import('@/services/mensageria');
            await removerTodasNotificacoes();
            definirNotificacoes([]);
            toast.success('Todas as notificações foram removidas.');
        } catch (error) {
            toast.error('Erro ao remover todas as notificações.');
        }
    };

    const handleRemover = async (id: string) => {
        try {
            const { removerNotificacao } = await import('@/services/mensageria');
            await removerNotificacao(id);
            removerNotificacaoLocal(id);
        } catch (error) {
            toast.error('Erro ao remover notificação.');
        }
    };

    return (
        <div className="flex min-h-screen h-screen m-0 bg-white">
            <Sidebar />
            {isLoading ? (
                    <div className="fixed inset-0 flex items-center justify-center">
                    <LoadingPage />
                    </div>
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
                            <div className="flex gap-2">
                                <Button
                                    text="Marcar todas como lidas"
                                    icon={<CheckIcon />}
                                    size="small"
                                    colorScheme="light-green"
                                    onClick={handleMarcarTodasComoLidas}
                                />
                                <Button
                                    text="Remover todas"
                                    icon={<TrashIcon />}
                                    size="small"
                                    colorScheme="light-green"
                                    onClick={handleRemoverTodasNotificacoes}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Lista de notificações */}
                    <NotificacaoList 
                        notificacoes={notificacoes}
                        onMarcarComoLida={handleMarcarComoLida}
                        onRemover={handleRemover}
                    />
                </div>
            </div>
            )}
            <ToastNotification />
        </div>
    );
}