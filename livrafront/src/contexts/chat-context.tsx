"use client";

import { createContext, useContext, useMemo, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
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

const STORAGE_KEY = 'livrabot';
const MAX_MESSAGES = 200;
const trim = (arr: ChatMessage[]) => (arr.length > MAX_MESSAGES ? arr.slice(arr.length - MAX_MESSAGES) : arr);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.messages)) setMessages(parsed.messages as ChatMessage[]);
      if (typeof parsed.isOpen === 'boolean') setIsOpen(parsed.isOpen);
    } catch {
      // ignora
    }
  }, []);

  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);
  const resetChat = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  // evita setState em componente desmontado
  const isMounted = useRef(true);
  const pendingCount = useRef(0);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // persiste mensagens + isOpen no localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const payload = { messages: trim(messages), isOpen };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // armazenamento cheio ou inacessível
      }
    }, 200);
    return () => clearTimeout(t);
  }, [messages, isOpen]);

  // sincroniza entre abas/janelas
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        if (!e.newValue) {
          setMessages([]);
          setIsOpen(false);
          return;
        }
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages as ChatMessage[]);
        if (typeof parsed.isOpen === 'boolean') setIsOpen(parsed.isOpen);
      } catch {
        // ignora
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  const sendMessage = useCallback(async (userPrompt: string) => {
    pendingCount.current += 1;
    if (isMounted.current) setIsLoading(true);

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userPrompt,
      ts: Date.now()
    };

    setMessages((prev) => trim([...prev, newMessage]));

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await postAnalyzeAgent({
        userPrompt,
        history: historyPayload
      } as AgentInputDTO);

      if (!isMounted.current) return;

      setMessages((prev) =>
        trim([
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: response.response, ts: Date.now() },
        ]),
      );
    } catch (error) {
      let errorMessage = 'Ocorreu um erro.';
      if (error instanceof Error) errorMessage = error.message;

      if (!isMounted.current) return;
      setMessages((prev) =>
        trim([
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Ops: ${errorMessage}`, ts: Date.now() },
        ]),
      );
    } finally {
      pendingCount.current = Math.max(0, pendingCount.current - 1);
      if (isMounted.current && pendingCount.current === 0) setIsLoading(false);
    }
  }, [messages]);

  const value = useMemo<ChatContextValue>(
    () => ({ messages, isOpen, isLoading, toggleOpen, sendMessage, resetChat }),
    [messages, isOpen, isLoading, toggleOpen, sendMessage, resetChat],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

let _useChatWarned = false;
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    if (!_useChatWarned) {
      console.warn('useChat usado fora de um ChatProvider — retornando fallback no-op.');
      _useChatWarned = true;
    }

    // caso o provider esteja ausente, dá um fallback com valores seguros  
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