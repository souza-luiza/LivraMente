'use client';

import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import { postAnalyzeAgent } from '@/services/llm';
import type { ChatMessage, AgentInputDTO } from '@/types/chat';

type ChatContextValue = {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  toggleOpen: () => void;
  sendMessage: (userPrompt: string) => Promise<void>;
  resetChat: () => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);
  const resetChat = useCallback(() => setMessages([]), []);

  const sendMessage = async (userPrompt: string) => {
    setIsLoading(true);
    
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: userPrompt, ts: Date.now() }, 
    ]);

    try {
      const response = await postAnalyzeAgent({ userPrompt });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: response.response, ts: Date.now() },
      ]);
    } catch (error) {
      let errorMessage = 'Ocorreu um erro.';
      if (error instanceof Error) errorMessage = error.message;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Ops: ${errorMessage}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<ChatContextValue>( () => ({
    messages, isOpen, isLoading, toggleOpen, sendMessage, resetChat
  }), [messages, isOpen, isLoading, toggleOpen, sendMessage, resetChat],);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

let _useChatWarned = false;
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    if (!_useChatWarned) {
      // One-time developer warning to help migration; avoid runtime crash.
      // eslint-disable-next-line no-console
      console.warn('useChat usado fora de um ChatProvider — retornando fallback no-op.');
      _useChatWarned = true;
    }

    // Safe no-op fallback to avoid runtime exceptions when provider is missing.
    return {
      messages: [],
      isOpen: false,
      isLoading: false,
      toggleOpen: () => undefined,
      sendMessage: async () => undefined,
      resetChat: () => undefined,
    } as ChatContextValue;
  }
  return context;
};