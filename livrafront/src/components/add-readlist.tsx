import { Livro } from "@/types/livros";
import Input from "./general-input";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Button from "./button";
import TrashIcon from "./icons/TrashIcon";
import SaveIcon from "./icons/SaveIcon";
import { Readlist } from "@/types/readlist";

interface AddReadlistProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // para adicionar livro/readlist
}

export default function AddReadlist({ isOpen, onClose, onSave }: AddReadlistProps) {
    const [readlists, setReadlists] = useState<Readlist[]>([]);
    const [busca, setBusca] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [listaSelecionados, setListaSelecionados] = useState<Readlist[]>([]);

    useEffect(() => {
        async function carregarLivros() {
            // const livrosTotal = await findAllBooks();
            // setLivros(livrosTotal);

            const MOCK: Readlist[] = [
                { _id: '1', nome: "Dom Casmurro", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '2', nome: "O Senhor dos Anéis", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '3', nome: "1984", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '4', nome: "Harry Potter e a Pedra Filosofal", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '5', nome: "Harry Potter e a Câmara Secreta", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '6', nome: "Harry Potter e o Prisioneiro de Azkaban", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '7', nome: "O Código Da Vinci", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '8', nome: "A Culpa é das Estrelas", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '9', nome: "Percy Jackson: O Ladrão de Raios", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '10', nome: "O Pequeno Príncipe", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '11', nome: "Moby Dick", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '12', nome: "Orgulho e Preconceito", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '13', nome: "O Morro dos Ventos Uivantes", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '14', nome: "Crime e Castigo", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '15', nome: "O Hobbit", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '16', nome: "Sherlock Holmes: Um Estudo em Vermelho", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '17', nome: "A Metamorfose", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '18', nome: "O Alquimista", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '19', nome: "It: A Coisa", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '20', nome: "O Iluminado", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '21', nome: "O Nome do Vento", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '22', nome: "Neuromancer", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '23', nome: "Duna", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '24', nome: "Admirável Mundo Novo", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '25', nome: "O Senhor das Moscas", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '26', nome: "A Revolução dos Bichos", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '27', nome: "O Conto da Aia", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '28', nome: "O Sol é Para Todos", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '29', nome: "A Menina que Roubava Livros", slug: "", publica: true, criador: 'criador', livros: [] },
                { _id: '30', nome: "Jogos Vorazes", slug: "", publica: true, criador: 'criador', livros: [] }
            ];

            setReadlists(MOCK);
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

    const handleSelect = (readlist: Readlist) => {
        const jaSelecionado = listaSelecionados.some(l => l._id === readlist._id);
        if(jaSelecionado) return;

        setListaSelecionados(prev => [...prev, readlist]);
    };

    const handleRemoveSelect = (id: string) => {
        setListaSelecionados(prev => prev.filter(r => r._id !== id));
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
                        <label className="text-h5">Selecione suas readlists para o livro</label>
                        <Input 
                            id="busca"
                            type="text"
                            placeholder="Busque ou selecione uma readlist"
                            disabled={isLoading}
                            value={busca}
                            onChange={handleChange}
                            fullWidth
                        />
                        <div className="w-full grid grid-cols-3 p-2 gap-2 bg-gray-200 overflow-y-auto medium-border-radius">
                            {readlists.map((readlist) => {
                                const isSelected = listaSelecionados.some(r => r._id === readlist._id);

                                return (
                                    <div key={readlist._id} className={`w-full flex items-center p-2 gap-2 bg-white hover:shadow-md hover:cursor-pointer 
                                                                        transition-shadow medium-border-radius 
                                                                        ${isSelected ? "opacity-50 pointer-events-none" : "opacity-100"}`} 
                                                                        onClick={() => handleSelect(readlist)}>
                                        <Image 
                                            src={readlist.capa_url ? readlist.capa_url : '/ReadlistDefault.png'}
                                            alt="Capa da readlist"
                                            width={40}
                                            height={40}
                                            className="object-cover rounded-lg"
                                        />
                                        <p className="text-b2 line-clamp-2">{readlist.nome}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col items-center px-2 gap-2">
                        <label className="text-h5">Readlists selecionadas:</label>
                        <div className="w-full overflow-y-auto flex flex-1 flex-col gap-2 px-2">
                            {listaSelecionados.length === 0 ? (
                                <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                    Nenhuma readlist foi selecionada ainda.
                                </p>
                            ) : (
                                listaSelecionados.map((readlist) => (
                                    <motion.div 
                                        key={readlist._id}
                                        className="w-full flex flex-row justify-between items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                                            active:opacity-95
                                            hover:opacity-90 hover:cursor-pointer
                                            disabled:opacity-70 disabled:cursor-not-allowed
                                            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black group"
                                        whileHover={{ scale: 1.01, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                                        onClick={() => handleRemoveSelect(readlist._id)}
                                    >
                                        <span>{readlist.nome}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"><TrashIcon size={24}/></span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className="flex w-full justify-end gap-2 px-2">
                            <Button icon={<TrashIcon/>} text={'Cancelar'} colorScheme="light-brown" />
                            <Button icon={<SaveIcon/>} text={'Adicionar livro'} colorScheme="dark-green" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}