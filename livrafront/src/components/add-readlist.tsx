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
import { addBookToReadlist, addReadlistToBook, getOwnReadlists } from "@/services/readlists";
import { Readlist } from "@/types/readlist";

interface AddReadlistProps {
    isOpen: boolean;
    onClose: () => void;
    livroId: string;
    onSave: () => void;
    readlistsLivro: Readlist[];
}

export default function AddReadlist({ isOpen, onClose, livroId, onSave, readlistsLivro }: AddReadlistProps) {
    const [readlists, setReadlists] = useState<Readlist[]>([]);
    const [readlistsTotal, setReadlistsTotal] = useState<Readlist[]>([]);
    const [busca, setBusca] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [listaSelecionados, setListaSelecionados] = useState<Readlist[]>([]);

    useEffect(() => {

        const fetchReadlists = async () => {
            try {
                const totalReadlists = await getOwnReadlists(); // retornar todas readlists do user
                const readlistsFilt = totalReadlists.filter((readlist) => !readlistsLivro.some(r => r._id === readlist._id)); // elimina do total as readlists que ja estao relacionadas com o livro

                setReadlists(readlistsFilt);
                setReadlistsTotal(readlistsFilt);

            } catch(error) {
                toast.error("Erro ao carregar readlists.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReadlists();
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // busca readlist pelo input
        const value = e.target.value;
        setBusca(e.target.value);

        if(value.trim() === "") {
            setReadlists(readlistsTotal);
            return;
        }
        
        const readlistsFiltrados = readlistsTotal.filter((readlist) => readlist.nome.toLowerCase().includes(value.toLowerCase()));
        setReadlists(readlistsFiltrados);
    };

    const handleSelect = (readlist: Readlist) => {
        const jaSelecionado = listaSelecionados.some(r => r._id === readlist._id);
        if(jaSelecionado) return;

        setListaSelecionados(prev => [...prev, readlist]);
    };

    const handleRemoveSelect = (id: string) => {
        setListaSelecionados(prev => prev.filter(r => r._id !== id));
    };

    const handleAddReadlist = async () => {
        if(listaSelecionados.length === 0) return;

        try {
            // Adicionar lista de readlists no livro
            const readlistIds = listaSelecionados.map(r => r._id);
            const updatedLivro = await addReadlistToBook(livroId, readlistIds);

            onSave?.();
            setListaSelecionados([]);
            setBusca("");
            onClose();

            toast.success("Livro adicionado com sucesso!");
        } catch(error)  {
            toast.error("Erro ao adicionar livro nas readlists.")
        }
    }

    const handleCancel = async () => {
        setListaSelecionados([]);
        setBusca("");
        onClose();
    }

    if(!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key={'add-readlist'}
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onClick={handleCancel}
            >
                <div className="flex flex-shrink-0 flex-row justify-center bg-white medium-padding medium-border-radius gap-4"
                    style={{ color: 'var(--primary-800)', width: '80%', height: '80%' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center gap-2 w-1/2">
                        <label className="text-h5">Selecione as readlists para seu livro</label>
                        <Input 
                            id="busca"
                            type="text"
                            placeholder="Busque ou selecione uma readlist"
                            disabled={isLoading}
                            value={busca}
                            onChange={handleChange}
                            fullWidth
                        />
                        { isLoading ? (
                            <LoadingComponent size="small" className="p-8" />
                        ) : (
                            <div className="w-full grid grid-cols-3 p-2 gap-2 bg-gray-200 overflow-y-auto medium-border-radius">
                                    {readlists.map((readlist) => {
                                        const isSelected = listaSelecionados.some(r => r._id === readlist._id);
        
                                        return (
                                            <div key={readlist._id} className={`w-full flex items-center p-2 gap-2 bg-white hover:shadow-md 
                                                                            hover:cursor-pointer transition-shadow medium-border-radius 
                                                                            ${isSelected ? "opacity-50 pointer-events-none" : "opacity-100"}`} 
                                                                            onClick={() => handleSelect(readlist)}>
                                                <Image 
                                                    src={readlist.capa_url ? readlist.capa_url : '/ReadlistDefault.png'}
                                                    alt="Capa da readlist"
                                                    width={60}
                                                    height={60}
                                                    className="object-cover rounded-lg"
                                                />
                                                <p className="text-b2 line-clamp-2">{readlist.nome}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
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
                            <Button icon={<TrashIcon/>} text={'Cancelar'} colorScheme="light-brown" onClick={handleCancel} />
                            <Button icon={<SaveIcon/>} text={'Adicionar Livro'} colorScheme="dark-green" onClick={handleAddReadlist} />
                        </div>
                    </div>
                </div>
            </motion.div>
            <ToastNotification />
        </AnimatePresence>
    )
}