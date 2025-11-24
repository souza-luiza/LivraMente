'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoIcon from '@/components/icons/LogoIcon';
import Button from '@/components/button';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';
import { useChat } from '@/contexts/chat-context';

export default function WidgetChat() {
  const { isOpen, toggleOpen, messages, sendMessage, isLoading } = useChat();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, isOpen]);

  const onSend = async (preset?: string) => {
    const text = preset ?? input ?? '';
    if (!text.trim()) return;
    setInput('');
    if (inputRef.current) inputRef.current.value = '';
    await sendMessage(text);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        onClick={toggleOpen}
        className="group fixed bottom-4 right-4 z-50 rounded-full shadow-lg px-4 py-3 bg-[var(--primary-300)] text-[#1F2A17] flex items-center gap-3 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-300)]"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="sr-only">{isOpen ? 'Fechar chat' : 'Abrir chat'}</span>

        {/* Icon only on small screens, logo + text on larger */}
        <LogoIcon size={30} fill="#1F2A17" />


        {/* Tooltip (use same visual pattern as `Button`): animated, themed */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              data-testid="tooltip"
              className={`absolute z-40 right-full mr-2 top-1/2 -translate-y-1/2 px-[10px] py-[5px] dark-brown text-h6 rounded-[8px] whitespace-nowrap pointer-events-none opacity-0 transition-all duration-150 group-hover:opacity-100`}
              role="tooltip"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {isOpen ? 'Fechar chat' : 'Abrir chat'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>


      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="widget-chat"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="fixed bottom-20 right-4 z-40 w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Widget de atendimento LivraMente"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: 'var(--primary-300)' }}
            >
              <div className="flex items-center gap-3">
                <LogoIcon size={28} fill="#1F2A17" />
                <div className="flex flex-col">
                  {/* Title uses b1 / bl-semibold as spec */}
                  <span className="text-b1 bl-semibold text-[#1F2A17]">Assistente LivraMente</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-3 flex flex-col overflow-hidden">
              {/* Empty state prompt (b2 / b3) */}
              {!messages.some((m) => m.role === 'user') && (
                <div className="mb-2 text-center">
                  <h2 className="text-b1 body-semibold text-gray-900">Como posso te ajudar?</h2>
                  <p className="text-b3 text-gray-600 mt-1">Faça perguntas sobre leituras, comunidades, sua conta e muito mais.</p>
                </div>
              )}

              {/* Messages area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2 pb-2"
                data-testid="messages-area"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-[#3D552F] text-white'
                          : 'bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                      style={{
                        fontFamily: m.role === 'assistant' ? "'Poppins', sans-serif" : "'Poppins', sans-serif",
                      }}
                    >
                      <p className="text-b3">{m.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="text-xs text-gray-500 mt-1">Gerando resposta…</div>
                )}
              </div>

              {/* Input area (boxed, matching story-creator) */}
              <div className="border-t border-gray-200 bg-white">
                <div className="max-w-full mx-auto px-2 py-2 flex flex-col">
                  <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                    <div className="w-full">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onSend();
                          }
                        }}
                        placeholder="Escreva aqui…"
                        aria-label="Mensagem para o assistente"
                        className="text-b2 w-full flex-1 bg-transparent border-none outline-none px-2 py-1 min-h-[28px] text-gray-900 placeholder-gray-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex h-full">
                      <Button aria-label="Enviar mensagem" icon={<ArrowRightIcon />} size="small" colorScheme="dark-green" onClick={() => onSend()} disabled={isLoading || !input.trim()} />
                    </div>
                  </div>
                  <p className="text-b3 text-gray-600 mt-1 text-center">O assistente pode cometer erros. Use com cautela. </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
