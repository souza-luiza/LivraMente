import { Livro } from "@/types/livros";
import Input from "./general-input";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Button from "./button";
import TrashIcon from "./icons/TrashIcon";
import SaveIcon from "./icons/SaveIcon";
import { livrosService } from "@/services/livros";
import ToastNotification from "@/components/toast-notification";
import { toast } from "react-toastify";
import LoadingComponent from "./portable-loading";

interface AddBookProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // para adicionar livro/readlist
}

export default function AddBook({ isOpen, onClose, onSave }: AddBookProps) {
    const [livros, setLivros] = useState<Livro[]>([]);
    const [livrosTotal, setLivrosTotal] = useState<Livro[]>([]);
    const [busca, setBusca] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [listaSelecionados, setListaSelecionados] = useState<Livro[]>([]);

    useEffect(() => {

        const fetchBooks = async () => {
            try {
                const totalLivros = await livrosService.getBooks();
                setLivros(totalLivros);
                setLivrosTotal(totalLivros);

            } catch(error) {
                toast.error("Erro ao carregar livros.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // busca livro pelo input
        const value = e.target.value;
        setBusca(e.target.value);

        if(value.trim() === "") {
            setLivros(livrosTotal);
            return;
        }
        
        const livrosFiltrados = livrosTotal.filter((livro) => livro.titulo.toLowerCase().includes(value.toLowerCase()));
        setLivros(livrosFiltrados);
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
                    <div className="flex flex-col items-center gap-2 w-1/2">
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
                        { isLoading ? (
                            <LoadingComponent size="small" className="p-8" />
                        ) : (
                            <div className="w-full grid grid-cols-3 p-2 gap-2 bg-gray-200 overflow-y-auto medium-border-radius">
                                    {livros.map((livro) => {
                                        const isSelected = listaSelecionados.some(l => l._id === livro._id);
        
                                        return (
                                            <div key={livro._id} className={`w-full flex items-center p-2 gap-2 bg-white hover:shadow-md 
                                                                            hover:cursor-pointer transition-shadow medium-border-radius 
                                                                            ${isSelected ? "opacity-50 pointer-events-none" : "opacity-100"}`} 
                                                                            onClick={() => handleSelect(livro)}>
                                                <Image 
                                                    src={livro.capa_url ? livro.capa_url : '/team/Kemi.jpg'}
                                                    alt="Capa do livro"
                                                    width={40}
                                                    height={60}
                                                    className="object-cover rounded-lg"
                                                />
                                                <p className="text-b2 line-clamp-2">{livro.titulo}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                    <div className="w-1/2 flex flex-col items-center px-2 gap-2">
                        <label className="text-h5">Livros selecionados:</label>
                        <div className="w-full overflow-y-auto flex flex-1 flex-col gap-2 px-2">
                            {listaSelecionados.length === 0 ? (
                                <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                    Nenhum livro foi selecionado ainda.
                                </p>
                            ) : (
                                listaSelecionados.map((livro) => (
                                    <motion.div 
                                        key={livro._id}
                                        className="w-full flex flex-row justify-between items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                                            active:opacity-95
                                            hover:opacity-90 hover:cursor-pointer
                                            disabled:opacity-70 disabled:cursor-not-allowed
                                            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black group"
                                        whileHover={{ scale: 1.01, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                                        onClick={() => handleRemoveSelect(livro._id)}
                                    >
                                        <span>{livro.titulo}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"><TrashIcon size={24}/></span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className="flex w-full justify-end gap-2 px-2">
                            <Button icon={<TrashIcon/>} text={'Cancelar'} colorScheme="light-brown" />
                            <Button icon={<SaveIcon/>} text={'Adicionar Livros'} colorScheme="dark-green"  />
                        </div>
                    </div>
                </div>
            </motion.div>
            <ToastNotification />
        </AnimatePresence>
    )
}