'use client';

import { useEffect, useRef } from "react";
import { useState } from "react";
import Button from "@/components/button";
import SaveIcon from "@/components/icons/SaveIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import TextlessButton from "@/components/textless-button";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

export default function CreateStory() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [buttonAlign, setButtonAlign] = useState<'center' | 'flex-end'>('center');

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = '60px';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = Math.min(scrollHeight, 280) + 'px';
            setButtonAlign(scrollHeight > 60 ? 'flex-end' : 'center');
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Simula a Resposta da IA, trocar para a API real (provavelmente do Gemini) aqui
        setTimeout(() => {
        setMessages((prev) => [
            ...prev,
            {
            role: 'assistant',
            content: 'Aqui é onde o conteúdo da história gerada pela IA apareceria. Conectar o Gemini (ou outra IA) aqui',
            },
        ]);
        setIsLoading(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
            <div className="mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                </div>
                <div>
                <h2 className="text-h2 font-semibold text-gray-900 dark:text-white">Criador de Histórias</h2>
                </div>
            </div>
            {/* <Button colorScheme="dark-green" size="medium" text={"Salvar Rascunho"} icon={<SaveIcon />}/> */}
            </div>
        </header>

        {/* Chat Messages Area */}
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
                <div className="text-center py-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-6">
                </div>
                <h4 className="text-h4 font-semibold text-gray-900 dark:text-white mb-2">
                    Comece a criar a sua história!
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Descreva a sua ideia de história, personagens ou enredo, e eu ajudarei você a criar uma narrativa envolvente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {[
                    'Escreva uma fantasia épica com dragões e magia',
                    'Crie um mistério ambientado na Londres vitoriana',
                    'Conte uma história de ficção científica sobre Aliens',
                    'Desenvolva um romance em uma pequena cidade costeira',
                    ].map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => setInput(suggestion)}
                        className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-left transition-colors text-sm text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600"
                    >
                        {suggestion}
                    </button>
                    ))}
                </div>
                </div>
            ) : (
                <div className="space-y-4">
                {messages.map((message, idx) => (
                    <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                    <div
                        className={`max-w-3xl rounded-lg px-4 py-3 ${
                        message.role === 'user'
                            ? 'bg-primary-600 dark:bg-primary-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                        {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {/* <SparklesIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" /> */}
                            </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                        </div>
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                    <div className="max-w-3xl rounded-lg px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>
        </main>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky bottom-0">
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 focus-within:border-transparent">
                <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Descreva sua ideia de história, peça reviravoltas de enredo, desenvolvimento de personagens..."
                className="flex-1 items-center resize-none bg-transparent border-none outline-none px-2 py-2 min-h-[60px] max-h-[280px] overflow-y-auto text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={1}
                disabled={isLoading}
                />
                <div className="flex h-full">
                    <TextlessButton icon={<ArrowRightIcon />} size="medium" colorScheme="dark-green" onClick={handleSend} disabled={isLoading || !input.trim()} />
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                O Criador de Histórias é alimentado por IA e pode gerar conteúdo impreciso ou inadequado. Use com cautela.
            </p>
            </div>
        </div>
        </div>
    );
}