'use client';

import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { postGenerateText } from '@/services/llm';
import type { ChatMessage, ChatState } from '@/types/chat';

type ChatContextValue = ChatState & {
  toggleOpen: () => void;
  sendMessage: (texto: string, opts?: { genres?: string[]; wordLimit?: number }) => Promise<void>;
  resetChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen(v => !v), []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setStoryId(null);
  }, []);

  const sendMessage = useCallback(async (texto: string, opts?: { genres?: string[]; wordLimit?: number }) => {
    if (!texto.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: texto,
      ts: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await postGenerateText({
        userWriting: texto,
        storyId,
        genres: opts?.genres,
        wordLimit: opts?.wordLimit,
      });
      setStoryId(resp.storyId);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: resp.textoCapitulo,
        options: resp.novasOpcoes,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Erro ao gerar resposta: ${err?.message ?? 'desconhecido'}`,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  const value = useMemo<ChatContextValue>(() => ({
    messages, storyId, isOpen, isLoading, toggleOpen, sendMessage, resetChat
  }), [messages, storyId, isOpen, isLoading, toggleOpen, sendMessage, resetChat]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat deve ser usado dentro de <ChatProvider>');
  return ctx;
}
