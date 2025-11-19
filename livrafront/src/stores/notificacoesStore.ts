import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notificacao } from '../types/notificacao';

type PreferenciasNotificacoes = {
    curtidas: boolean;
    comentarios: boolean;
    mencoes: boolean;
    novosSeguidores: boolean;
};

type EstadoPreferenciasNotificacoes = {
    preferencias: PreferenciasNotificacoes;
    alterarPreferencia: (tipo: keyof PreferenciasNotificacoes, valor: boolean) => void;
    deveNotificar: (tipoNotificacao: string) => boolean;
};

type EstadoNotificacoes = {
    notificacoes: Notificacao[];
    adicionarNotificacao: (notificacao: Notificacao) => void;
    definirNotificacoes: (notificacoes: Notificacao[]) => void;
    limparNotificacoes: () => void;
    marcarComoLida: (id: string) => void;
    marcarTodasComoLidas: () => void;
    removerNotificacao: (id: string) => void;
    contarNaoLidas: () => number;
};

export const useNotificationsStore = create<EstadoNotificacoes>()(
    persist(
        (set, get) => ({
    notificacoes: [],

    adicionarNotificacao: (notificacao) => set((state) => ({
        notificacoes: [notificacao, ...state.notificacoes]
    })),
    
    // Define o estado completo de notificações
    definirNotificacoes: (notificacoes) => set(() => ({
        notificacoes: notificacoes
    })),

    limparNotificacoes: () => set(() => ({
        notificacoes: []
    })),
    
    marcarComoLida: (id) => set((state) => ({
        notificacoes: state.notificacoes.map(notif =>
            notif.id === id ? { ...notif, lida: true } : notif
        )
    })),
    
    marcarTodasComoLidas: () => set((state) => ({
        notificacoes: state.notificacoes.map(notif => ({ ...notif, lida: true }))
    })),
    
    removerNotificacao: (id) => set((state) => ({
        notificacoes: state.notificacoes.filter(notif => notif.id !== id)
    })),
    
    contarNaoLidas: () => {
        const state = get();
        return state.notificacoes.filter(notif => !notif.lida).length;
    }
}),
        {
            name: 'notificacoes-storage', 
            partialize: (state) => ({ notificacoes: state.notificacoes }),
        }
    )
);   

export const useNotPrefStore = create<EstadoPreferenciasNotificacoes>()(
    persist(
        (set, get) => ({
            preferencias: {
                curtidas: true,
                comentarios: true,
                mencoes: true,
                novosSeguidores: true,
            },

            alterarPreferencia: (tipo, valor) => set((state) => ({
                preferencias: {
                    ...state.preferencias,
                    [tipo]: valor
                }
            })),

            deveNotificar: (tipoNotificacao: string) => {
                const { preferencias } = get();
                
                const mapeamento: Record<string, keyof PreferenciasNotificacoes> = {
                    'curtida_post': 'curtidas',
                    'curtida_resenha': 'curtidas',
                    'comentario_post': 'comentarios',
                    'comentario_resenha': 'comentarios',
                    'resposta_comentario': 'comentarios',
                    'mencao': 'mencoes',
                    'novo_seguidor': 'novosSeguidores',
                    'novo_post_comunidade': 'curtidas',
                };

                const preferencia = mapeamento[tipoNotificacao];
                if (!preferencia) return true;
                return preferencias[preferencia];
            }
        }),
        {
            name: 'notificacoes-preferencias-storage',
            partialize: (state) => ({ preferencias: state.preferencias })
        }
    )
);