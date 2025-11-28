import { Livro } from "@/types/livros";
import Input from "./general-input";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Button from "./button";
import AddIcon from "./icons/AddIcon";
import TrashIcon from "./icons/TrashIcon";

interface AddBookReadlistProps {
    tipo?: "book" | "readlist";
    isOpen: boolean;
    onClose: () => void;
    onSave: (livros: Livro) => void; // para adicionar livro/readlist
}

export default function AddBookReadlist({ tipo, isOpen, onClose, onSave }: AddBookReadlistProps) {
    const [livros, setLivros] = useState<Livro[]>([]);
    const [busca, setBusca] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [listaSelecionados, setListaSelecionados] = useState<Livro[]>([]);

    useEffect(() => {
        async function carregarLivros() {
            // const livrosTotal = await findAllBooks();
            // setLivros(livrosTotal);

            const MOCK: Livro[] = [
                { _id: '1',  titulo: "Dom Casmurro",             slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '2',  titulo: "O Senhor dos Anéis",       slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '3',  titulo: "1984",                     slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '4',  titulo: "Harry Potter e a Pedra Filosofal", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '5',  titulo: "Harry Potter e a Câmara Secreta", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '6',  titulo: "Harry Potter e o Prisioneiro de Azkaban", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '7',  titulo: "O Código Da Vinci",        slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '8',  titulo: "A Culpa é das Estrelas",   slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '9',  titulo: "Percy Jackson: O Ladrão de Raios", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '10', titulo: "O Pequeno Príncipe",       slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '11', titulo: "Moby Dick",                slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '12', titulo: "Orgulho e Preconceito",    slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '13', titulo: "O Morro dos Ventos Uivantes", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '14', titulo: "Crime e Castigo",          slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '15', titulo: "O Hobbit",                 slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '16', titulo: "Sherlock Holmes: Um Estudo em Vermelho", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '17', titulo: "A Metamorfose",            slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '18', titulo: "O Alquimista",             slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '19', titulo: "It: A Coisa",              slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '20', titulo: "O Iluminado",              slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '21', titulo: "O Nome do Vento",          slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '22', titulo: "Neuromancer",              slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '23', titulo: "Duna",                     slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '24', titulo: "Admirável Mundo Novo",     slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '25', titulo: "O Senhor das Moscas",      slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '26', titulo: "A Revolução dos Bichos",   slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '27', titulo: "O Conto da Aia",           slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '28', titulo: "O Sol é Para Todos",       slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '29', titulo: "A Menina que Roubava Livros", slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 },
                { _id: '30', titulo: "Jogos Vorazes",            slug: "", isbn: "", autores: [], ano_publicacao: 0, sinopse: "", numero_paginas: 0, generos: [], avaliacoes_count: 0, avaliacoes_media: 0 }
            ];
            setLivros(MOCK);
        }

        carregarLivros();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // busca livro pelo input
        const value  = e.target.value;
        setBusca(value);

        if(value.trim() !== "") {
            // const livrosBuscados = await findBooks(value); endpoint que procura livros por titulo
            // setLivros(livrosBuscados);
        } else {
            // const livrosTotal = await findAllBooks();
            // setLivros(livrosTotal);
        }
    };

    const handleSelect = (livro: Livro) => {
        const jaSelecionado = listaSelecionados.some(l => l._id === livro._id);
        if(jaSelecionado) return;

        setListaSelecionados(prev => [...prev, livro]);
    };

    const handleRemoveSelect = (id: string) => {
        setListaSelecionados(prev => prev.filter(l => l._id !== id));
    }

    if(!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onClick={onClose}
            >
                <div className="flex flex-shrink-0 flex-row justify-center bg-white medium-padding medium-border-radius gap-4"
                    style={{ color: 'var(--primary-800)', width: '80%', height: '80%' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center justify-center gap-2 w-1/2">
                        <label className="text-h5">Selecione os livros para sua readlist</label>
                        <Input 
                            id="busca"
                            type="text"
                            placeholder="Busque ou selecione um livro"
                            disabled={isLoading}
                            value={busca}
                            onChange={handleChange}
                            fullWidth
                        />
                        <div className="w-full grid grid-cols-3 p-2 gap-2 bg-gray-200 overflow-y-auto medium-border-radius">
                            {livros.map((livro) => {
                                const isSelected = listaSelecionados.some(l => l._id === livro._id);

                                return (
                                    <div key={livro._id} className={`w-full flex items-center p-2 gap-2 bg-white hover:shadow-md hover:cursor-pointer transition-shadow medium-border-radius ${isSelected ? "opacity-50 pointer-events-none" : "opacity-100"}`} onClick={() => handleSelect(livro)}>
                                        <Image 
                                            src={livro.capa_url ? livro.capa_url : '/team/Kemi.jpg'}
                                            alt="Capa do livro"
                                            width={40}
                                            height={60}
                                            className="object-cover rounded-lg"
                                        />
                                        <p className="text-b2 line-clamp-2">{livro.titulo}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col items-center pr-2 pl-2 overflow-y-auto gap-2">
                        <label className="text-h5">Livros selecionados:</label>
                        {listaSelecionados.map((livro) => (
                            <motion.div 
                                className="w-full flex flex-row items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                                    active:opacity-95
                                    hover:opacity-90 hover:cursor-pointer
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                                whileHover={{ scale: 1.01, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                                onClick={() => handleRemoveSelect(livro._id)}
                            >
                                {livro.titulo}
                            </motion.div>
                        ))}
                        <Button icon={<AddIcon/>} text={'Adicionar livros'} colorScheme="dark-green" fullwidth />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}