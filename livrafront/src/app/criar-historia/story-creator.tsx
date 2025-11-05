'use client';

import { useEffect, useRef } from "react";
import { useState } from "react";
import Button from "@/components/button";
import SaveIcon from "@/components/icons/SaveIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import FantasyIcon from "@/components/icons/FantasyIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import MysteryIcon from "@/components/icons/MysteryIcon";
import TerrorIcon from "@/components/icons/TerrorIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import AdventureIcon from "@/components/icons/AdventureIcon";
import MultipleUsersIcon from "@/components/icons/MultipleUsersIcon";
import ClosedBookIcon from "@/components/icons/ClosedBookIcon";
import AddIcon from "@/components/icons/AddIcon";
import ZombieIcon from "@/components/icons/ZombieIcon";

const SUGESTOES_POOL = [
    {text: 'Escreva uma fantasia épica com dragões e magia', icon: <FantasyIcon size={54} />},
    {text: 'Crie um mistério ambientado na Londres vitoriana', icon: <MysteryIcon size={54} />},
    {text: 'Conte uma história de ficção científica sobre Aliens', icon: <TerrorIcon size={54} />},
    {text: 'Desenvolva um romance em uma pequena cidade costeira', icon: <HeartIcon fill="currentColor" size={54} />},
    {text: 'Elabore uma história de terror em uma casa assombrada', icon: <TerrorIcon size={54} />},
    {text: 'Invente uma aventura de piratas em alto mar', icon: <AdventureIcon size={54} />},
    {text: 'Descreva uma jornada de autodescoberta em um mundo pós-apocalíptico', icon: <ZombieIcon size={54} />},
    {text: 'Crie uma fábula com uma lição moral sobre amizade', icon: <MultipleUsersIcon size={54} />},
    {text: 'Imagine uma distopia futurista onde a tecnologia controla tudo', icon: <TerrorIcon size={54} />},
    {text: 'Desenvolva uma comédia romântica ambientada em uma livraria', icon: <HeartIcon fill="currentColor" size={54} />},

];

type Opcao = {
  id: number;
  texto: string;
};

type HistoriaResposta = {
  storyId: string;
  textoCapitulo: string;
  novasOpcoes: Opcao[];
}

export default function CreateStory() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [buttonAlign, setButtonAlign] = useState<'center' | 'flex-end'>('center');
    const [storyId, setStoryId] = useState<string | null>(null);
    const [opcoes, setOpcoes] = useState<Opcao[]>([]);
    const [sugestoes, setSugestoes] = useState<typeof SUGESTOES_POOL>([]);

    useEffect(() => {
        const shuffled = [...SUGESTOES_POOL].sort(() => 0.5 - Math.random());
        setSugestoes(shuffled.slice(0, 4));
    }, []);

    const handleNewStory = () => {
        localStorage.removeItem('storyDraft');
        setMessages([]);
        setOpcoes([]);
        setStoryId(null);
        setInput('');
    };

    useEffect(() => {
    const savedDraft = localStorage.getItem('storyDraft');
        if (savedDraft) {
        try {
            const { messages, opcoes, storyId } = JSON.parse(savedDraft);
            setMessages(messages);
            setOpcoes(opcoes);
            setStoryId(storyId);
        } catch (e) {

            localStorage.removeItem('storyDraft');
        }
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
        const draft = {
            messages: messages,
            opcoes: opcoes,
            storyId: storyId,
        };
        localStorage.setItem('storyDraft', JSON.stringify(draft));
        }
    }, [messages, opcoes, storyId]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = '40px';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = Math.min(scrollHeight, 280) + 'px';
            setButtonAlign(scrollHeight > 40 ? 'flex-end' : 'center');
        }
    }, [input]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (opcaoTexto?: string) => {
        const userMessage = opcaoTexto || input.trim();

        if (!userMessage || isLoading) return;

        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setOpcoes([]);
        setIsLoading(true);

        const bodyPayload = { userWriting: userMessage, storyId: storyId };

        try {
        const response = await fetch('http://localhost:3001/llm/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar história');
        }

        const data: HistoriaResposta = await response.json();

        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.textoCapitulo },
        ]);

        setOpcoes(data.novasOpcoes);
        setStoryId(data.storyId);

        } catch (err: any) {
        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `Ops, algo deu errado: ${err.message}` },
        ]);
        } finally {
        setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-h2 font-semibold text-gray-900">Criador de Histórias</h2>
                    </div>
                </div>
            <Button colorScheme="dark-green" size="medium" text={"Nova História"} icon={<AddIcon />} onClick={handleNewStory}/>
            </div>
        </header>

        {/* Chat Messages Area */}
        <main className="flex-1 overflow-y-auto align-middle content-center">
            <div className="max-w-5xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
                <div className="text-center py-2">
                    <h4 className="text-h4 font-semibold text-gray-90 mb-2">
                        Comece a criar a sua história!
                    </h4>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Descreva a sua ideia de história, personagens ou enredo, e eu ajudarei você a criar uma narrativa envolvente.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {sugestoes.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInput(suggestion.text)}
                            className="p-4 active:opacity-95 hover:opacity-90 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black border-gray-200 rounded-lg text-left transition-colors text-sm dark-green hover:border-primary-300 flex items-center gap-2"
                        >
                            {suggestion.icon}
                            <span className="flex-1">{suggestion.text}</span>
                            <span className="flex items-center">
                                <ChevronRightIcon className="text-primary-600" size={32} />
                            </span>
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
                        className={`relative max-w-3xl rounded-lg px-4 py-3 ${
                        message.role === 'user'
                            ? 'light-green speech-bubble-user rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-900 speech-bubble-assistant rounded-tl-none'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                        {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {/* <SparklesIcon className="w-4 h-4 text-primary-600" /> */}
                            </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                        </div>
                    </div>
                    </div>
                ))}

                {!isLoading && opcoes.length > 0 && (
                    <div className="flex justify-start">
                    <div className="max-w-3xl w-full flex flex-col items-start gap-2">
                        {opcoes.map((opcao) => (
                        <button
                            key={opcao.id}
                            onClick={() => handleSend(opcao.texto)}
                            className="p-3 w-full text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
                            style={{border: '1px solid var(--secondary-100)'}}
                        >
                            {opcao.texto}
                        </button>
                        ))}

                        <div className="flex w-full gap-2 pt-2">
                        {/* O BOTÃO EXTRA - caso o user não goste de nenhuma opção */}
                        <button
                            onClick={() => handleSend("Nenhuma dessas. Me dê 4 opções diferentes.")}
                            className="p-3 w-full light-brown border-b-[1px] text-left bg-white border rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
                        >
                            Nenhuma das opções. Gerar novas ideias.
                        </button>

                        {/* Botão para iniciar nova história
                        <button
                            onClick={handleNewStory}
                            className="p-3 w-1/2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
                        >
                            Iniciar nova história
                        </button> */}
                        </div>
                        <div ref={messagesEndRef} />

                    </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-start">
                    <div className="flex gap-2 max-w-3xl rounded-lg px-4 py-3 light-green !bg-white">
                        <span className="text-b1 body-semibold" style={{ fontFamily: "Judson, serif" }}>Pensando</span>
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[var(--primary-800)] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[var(--primary-800)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-[var(--primary-800)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>
        </main>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0">
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                    <div className="w-full">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Descreva sua ideia de história, peça reviravoltas de enredo, desenvolvimento de personagens..."
                            className="w-full flex-1 items-center resize-none bg-transparent border-none outline-none px-2 py-2 min-h-[40px] max-h-[280px] overflow-y-auto text-gray-900 placeholder-gray-500"
                            rows={1}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex h-full">
                        <Button icon={<ArrowRightIcon />} size="medium" colorScheme="dark-green" onClick={() => handleSend()} disabled={isLoading || !input.trim()} />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    O Criador de Histórias é alimentado por IA e pode gerar conteúdo impreciso ou inadequado. Use com cautela.
                </p>
            </div>
        </div>
        </div>
    );
}