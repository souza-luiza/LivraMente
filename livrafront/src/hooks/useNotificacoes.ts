import { useEffect } from 'react';

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