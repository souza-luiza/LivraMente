'use client';

import { useNotificacoes } from '@/hooks/useNotificacoes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificacoesProvider({ children }: { children: React.ReactNode }) {
    useNotificacoes();
    return (
        <>
            {children}
            <ToastContainer 
                position="top-right" 
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                closeButton={true}
            />
        </>
    );
}