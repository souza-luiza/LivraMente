import { useEffect } from 'react';
import { useNotificationsStore } from "@/stores/notificacoesStore";
import { useNotPrefStore } from "@/stores/notificacoesStore";
import { conectarNotificacoes, getNotificacoes } from "@/services/mensageria";

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
                        
                        // Mostrar notificação do navegador
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Nova notificação', {
                                body: novaNotificacao.mensagem,
                                icon: '/favicon.ico'
                            });
                        }
                    }, 
                );
            } catch (error: any) {
                console.warn('Erro ao carregar notificações:', error);
            }
        };

        inicializar();
        
        return () => {
            desconectar?.();
        };
    }, [adicionarNotificacao, definirNotificacoes, deveNotificar]);
}