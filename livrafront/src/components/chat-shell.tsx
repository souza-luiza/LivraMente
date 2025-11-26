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
  // detecta rotas onde um widget embutido é renderizado na página
  const hasEmbeddedWidget =
    typeof pathname === 'string' &&
    pathname.includes('/comunidade/') &&
    pathname.includes('/postagem/');

  // só mostra o widget flutuante se NÃO for página de login/registro E
  // não for uma rota que já renderiza o widget embutido (para evitar duplicidade)
  return (
    <ChatProvider>
      {children}
      {!isAuthPage && !hasEmbeddedWidget && <WidgetChat />}
    </ChatProvider>
  );
}
