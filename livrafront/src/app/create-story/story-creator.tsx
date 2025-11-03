'use client';

import { useEffect, useRef } from "react";
import { useState, useMemo } from "react";
import Button from "@/components/button";
import SaveIcon from "@/components/icons/SaveIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import TextlessButton from "@/components/textless-button";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

const SUGESTOES_POOL = [
  'Escreva uma fantasia épica com dragões e magia',
  'Crie um mistério ambientado na Londres vitoriana',
  'Conte uma história de ficção científica sobre Aliens',
  'Desenvolva um romance em uma pequena cidade costeira',
  'Um detetive que viaja no tempo para resolver crimes',
  'A história de um chef que cozinha pratos mágicos',
  'Uma aventura de piratas em um mar de estrelas',
  'Um thriller psicológico sobre um escritor que...',
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

  const sugestoes = useMemo(() => {
    const shuffled = [...SUGESTOES_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
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

  const handleSend = async (opcaoTexto?: string) => {

    const userMessage = opcaoTexto || input.trim();

    if (!userMessage || isLoading) return;

    setInput('');
    setOpcoes([]);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
              </div>
              <h4 className="text-h4 font-semibold text-gray-900 dark:text-white mb-2">
                Comece a criar a sua história!
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Descreva a sua ideia de história, personagens ou enredo, e eu ajudarei você a criar uma narrativa envolvente.
                {/*não sei se ficou muito legal a disposição, mas da para deixar de sugestão*/}
                <br />
                <br />
                Escolha uma das sugestões abaixo para começar, caso não tenha ideia por onde iniciar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {sugestoes.map((suggestion, idx) => (
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

            // tela do chat - cometario que vou apagar depois
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-3 ${message.role === 'user'
                      ? 'bg-primary-600 dark:bg-teal-900 text-white'
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

              {/* Bloco 1: Renderiza as OPÇÕES (SE não estiver carregando E elas existirem) */}
              {!isLoading && opcoes.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-3xl w-full flex flex-col items-start gap-2">
                    {opcoes.map((opcao) => (
                      <button
                        key={opcao.id}
                        onClick={() => handleSend(opcao.texto)}
                        className="p-3 w-full text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-200"
                      >
                        {opcao.texto}
                      </button>
                    ))}

                    <div className="flex w-full gap-2 pt-2">
                      {/* O BOTÃO EXTRA - caso o user não goste de nenhuma opção */}
                      <button
                        onClick={() => handleSend("Nenhuma dessas. Me dê 4 opções diferentes.")}
                        className="p-3 w-1/2 text-left bg-white dark:bg-red-950 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-200"
                      >
                        Nenhuma das opções. Gerar novas ideias.
                      </button>

                      {/*Botão para iniciar nova história */}
                      <button
                        onClick={handleNewStory}
                        className="p-3 w-1/2 text-left bg-white dark:bg-green-950 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-200"
                      >
                        Iniciar nova história
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Bloco 2: Renderiza o LOADING (SE estiver carregando) */}
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
      </main >

      {/* Input Area */}
      < div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky bottom-0" >
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 focus-within:border-transparent">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={opcoes.length > 0
                ? 'Escolha uma das opções acima OU escreva sua própria ação...'
                : 'Descreva sua ideia de história, peça reviravoltas de enredo, desenvolvimento de personagens...'
              }
              className="flex-1 items-center resize-none bg-transparent border-none outline-none px-2 py-2 min-h-[60px] max-h-[280px] overflow-y-auto text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              disabled={isLoading}
            />
            <div className="flex h-full">
              <TextlessButton icon={<ArrowRightIcon />} size="medium" colorScheme="dark-green" onClick={() => handleSend()} disabled={isLoading || !input.trim()} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            O Criador de Histórias é alimentado por IA e pode gerar conteúdo impreciso ou inadequado. Use com cautela.
          </p>
        </div>
      </div >
    </div >
  );
}