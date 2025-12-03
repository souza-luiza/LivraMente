import { useEffect, createElement } from 'react';
import { useNotificationsStore } from "@/stores/notificacoesStore";
import { useNotPrefStore } from "@/stores/notificacoesStore";
import { conectarNotificacoes, getNotificacoes } from "@/services/mensageria";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { titleToSlug } from '@/lib/slugify';
import InfoIcon from '@/components/icons/InfoIcon';
import { Notificacao } from '@/types/notificacao';

//Solicita permissão de notificações do navegador (primeiro acesso)
export function useSolicitaPermissao() {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                console.log('Permissão de notificações:', permission);
            });
        }
    }, []);
}

//Gerencia a conexão de notificações em tempo real
export function useNotificacoes() {
    const { adicionarNotificacao, definirNotificacoes } = useNotificationsStore();
    const { deveNotificar } = useNotPrefStore();
    const router = useRouter();
    
    const navegarParaConteudo = (notificacao: Notificacao) => {
        switch (notificacao.tipo) {
            case 'novo_seguidor':
            case 'entrar_comunidade':
                if (notificacao.remetente?.username) {
                    router.push(`/${notificacao.remetente.username}`);
                }
                break;
            
            case 'promovido_moderador':
                if (notificacao.comunidadeNome && notificacao.postId) {
                    router.push(`/comunidade/${titleToSlug(notificacao.comunidadeNome)}`);
                }
                break;

            case 'novo_post_comunidade':
            case 'curtida_post':
            case 'comentario_post':
            case 'curtida_comentario':
            case 'moderacao_post':
                if (notificacao.postId && notificacao.comunidadeNome) {
                    router.push(`/comunidade/${titleToSlug(notificacao.comunidadeNome)}/postagem/${notificacao.postId}`);
                }
                break;
        
            default:
                router.push('/notificacoes');
                break;
        }
    };
    
    useEffect(() => {
        let desconectar: (() => void) | undefined;
        const inicializar = async () => {
            try {
                const notificacoes = await getNotificacoes();
                definirNotificacoes(notificacoes);
                desconectar = conectarNotificacoes(
                    (novaNotificacao) => {
                        // Verificar as preferências
                        if (!deveNotificar(novaNotificacao.tipo)) {
                            return; 
                        }
                        adicionarNotificacao(novaNotificacao);
                        
                        // Mostrar toast de notificação clicável
                        const toastId = toast(novaNotificacao.mensagem, {
                            position: 'top-right',
                            autoClose: 5000,
                            onClick: () => {
                                toast.dismiss(toastId);
                                navegarParaConteudo(novaNotificacao);
                            },
                            style: { cursor: 'pointer' },
                            className: 'notificacao-sse-toast',
                            icon: <InfoIcon size={24} className="text-primary-600" />,
                        });
                        
                        // Mostrar notificação do navegador
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Nova notificação', {
                                body: novaNotificacao.mensagem,
                                icon: '/favicon.ico'
                            });
                        }
                    },
                    (error) => {
                        console.warn('Erro na conexão SSE:', error);
                    }
                );
            } catch (error) {
                console.warn('Erro ao carregar notificações:', error);
            }
        };

        inicializar();
        
        return () => {
            desconectar?.();
        };
    }, [adicionarNotificacao, definirNotificacoes, deveNotificar, router]);
}