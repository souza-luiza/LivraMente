'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChatProvider } from '@/contexts/chat-context';
import WidgetChat from '@/components/widget-chat';

type ChatShellProps = {
  children: React.ReactNode;
};

export function ChatShell({ children }: ChatShellProps) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === '/entrar' ||
    pathname === '/cadastro' ||
    pathname === '/' ||
    pathname === '/livratime' ||
    pathname === '/configuracoes' ||
    pathname === '/carregando';

// só mostra o widget se NÃO for página de login ou registro
  return (
    <ChatProvider>
      {children}
      {!isAuthPage && <WidgetChat />}
    </ChatProvider>
  );
}
