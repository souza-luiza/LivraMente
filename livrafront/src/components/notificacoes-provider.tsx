'use client';

import { useNotificacoes } from '@/hooks/useNotificacoes';
import ToastNotification from '@/components/toast-notification';

export default function NotificacoesProvider({ children }: { children: React.ReactNode }) {
    useNotificacoes();
    return (
        <>
            {children}
            <ToastNotification />
        </>
    );
}