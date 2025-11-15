'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useChat } from '@/contexts/chat-context';

export default function WidgetChat() {
  const { isOpen, toggleOpen, messages, sendMessage, isLoading } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const onSend = async (preset?: string) => {
    const text = preset ?? inputRef.current?.value ?? '';
    if (!text.trim()) return;
    if (inputRef.current) inputRef.current.value = '';
    await sendMessage(text, { wordLimit: 150 });
  };

  return (
    <>
      {/* Botão flutuante*/}
      <motion.button
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 rounded-full shadow-lg px-4 py-3 bg-[var(--primary-300)] text-[#1F2A17] body-semibold flex items-center gap-2 hover:brightness-95"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline">
          {isOpen ? '❌🐱' : '🐱'}
        </span>
      </motion.button>

      {/* Janela do chat*/}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="widget-chat"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed bottom-20 right-4 w-80 sm:w-96 h-[28rem] bg-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
          >
            <div className="relative">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: 'var(--primary-300)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-b1 body-semibold text-[#1F2A17]">
                      Assistente LivraMente
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 p-3 flex flex-col overflow-hidden">
                {/* Cabeçalho interno */}
                <div className="mb-2">
                    <h2 className="text-b1 body-semibold text-gray-900 text-center">
                    Como posso te ajudar?
                    </h2>
                    <p className="text-b3 text-gray-600 text-center mt-1">
                    Faça perguntas sobre leituras, comunidades, sua conta e muito mais.
                    </p>
                </div>

                {/* Área de mensagens */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-2">
                    {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                            m.role === 'user'
                            ? 'bg-[#2F855A] text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        }`}
                        >
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        </div>
                    </div>
                    ))}
                    {isLoading && (
                    <div className="text-xs text-gray-500 mt-1">
                        Gerando resposta…
                    </div>
                    )}
                </div>

                {/* Barra de input */}
                <div className="pt-2 mt-2 border-t border-gray-200 flex gap-2 items-center">
                    <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escreva aqui…"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F855A]/70 focus:border-[#2F855A]"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onSend();
                    }}
                    />
                    <button
                    onClick={() => onSend()}
                    className="px-3 py-2 text-sm rounded-lg bg-[#1F2A17] text-white body-semibold hover:brightness-110 disabled:opacity-50"
                    disabled={isLoading}
                    >
                    Enviar
                    </button>
                </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
