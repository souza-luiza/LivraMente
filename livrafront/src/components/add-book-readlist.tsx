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

    useEffect(() => {
        async function carregarLivros() {
            // const livrosTotal = await findAllBooks();
            // setLivros(livrosTotal);

            // MOCK para teste:
            const MOCK: Livro[] = [
                {
                    _id: '1', titulo: "Dom Casmurro",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '2', titulo: "O Senhor dos Anéis",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '3', titulo: "1984",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
                {
                    _id: '4', titulo: "Harry Potter",
                    slug: "",
                    isbn: "",
                    autores: [],
                    ano_publicacao: 0,
                    sinopse: "",
                    numero_paginas: 0,
                    generos: [],
                    avaliacoes_count: 0,
                    avaliacoes_media: 0
                },
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
                            {livros.map((livro) => (
                                <div className="w-full flex items-center p-2 gap-2 bg-white hover:shadow-md transition-shadow medium-border-radius">
                                    <Image 
                                        src={livro.capa_url ? livro.capa_url : '/team/Kemi.jpg'}
                                        alt="Capa do livro"
                                        width={40}
                                        height={60}
                                        className="object-cover rounded-lg"
                                    />
                                    <p className="text-b2 line-clamp-2">{livro.titulo}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col items-center gap-2">
                        <label className="text-h5">Livros selecionados:</label> {/*overflow-y-auto aqui!*/}
                        <motion.div 
                            className="w-full flex flex-row items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                                active:opacity-95
                                hover:opacity-90 hover:cursor-pointer
                                disabled:opacity-70 disabled:cursor-not-allowed
                                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                            whileHover={{ scale: 1.01, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                        >
                            titulo
                        </motion.div>
                        <motion.div 
                            className="w-full flex flex-row items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                                active:opacity-95
                                hover:opacity-90 hover:cursor-pointer
                                disabled:opacity-70 disabled:cursor-not-allowed
                                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                            whileHover={{ scale: 1.01, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                        >
                            titulo
                        </motion.div>
                        <Button icon={<AddIcon/>} text={'Adicionar livros'} colorScheme="dark-green" fullwidth />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}