"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

import { livrosService } from "@/services/livros";

import ToastNotification from "@/components/toast-notification";
import LoadingPage from "@/components/loading";
import { Livro } from "@/types/livros";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import { TabProvider, TabPanel, TabList, Tab } from "@/components/tabs";
import CommunityIcon from "@/components/icons/CommunityIcon";
import StarIcon from "@/components/icons/StarIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";

export default function LivroPage() {
    const params = useParams();
    const { bookslug } = params as { bookslug: string };

    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<Livro>();

    const [value, setValue] = useState('resenhas');
    
    useEffect(() => {

        async function fetchBookDetails() {
            
            try {

                const book = await livrosService.getBookBySlug(bookslug);
                setBook(book);

            } catch (error) {

                toast.error("Erro ao carregar detalhes do livro.");

            } finally {

                setLoading(false);
            }
        }

        fetchBookDetails();

    }, [bookslug]);

    if (!book) return null;
    if (loading) return <LoadingPage />;
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="w-full h-screen flex flex-col px-4 pb-2 gap-2">
                <SearchBar backgroundcolor="bg-gray-50"/>

                <main className="w-full h-full flex flex-row overflow-hidden gap-2 p-1">
                    <div className="h-full flex-1 flex flex-col gap-2">
                        <div className="flex flex-row items-start medium-box light-neutral shadow-sm hover:shadow-md gap-2">
                            <div className="relative aspect-[2/3] w-36 flex overflow-hidden small-border-radius large-border-width border-[#23160A]">
                                {book.capa_url && <Image
                                    src={book.capa_url}
                                    alt={`Capa do livro ${book.titulo}`}
                                    fill
                                    className="object-cover"
                                />}
                            </div>
                            <div className="w-full flex flex-col mt-2">
                                <h1 className="text-h4 line-clamp-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{book.titulo}</h1>
                                <p className="text-b1 body-quotation">{book.autores?.map((autor) => autor.nome).join(", ")}, {book.ano_publicacao}</p>
                            </div>
                            <div>
                                
                            </div>
                        </div>
                        <div className="flex flex-col medium-box light-neutral shadow-sm hover:shadow-md gap-1 overflow-y-auto">
                            <h6 className="text-h5 mb-1">Sinopse</h6>
                            <p className="text-b2 text-justify pr-1 overflow-y-auto">{book.sinopse ?? <span className="flex text-b1 body-quotation justify-center">Este livro não possui sinopse.   </span>}</p>
                        </div>
                    </div>
                    <div className="h-full flex-1 flex medium-box shadow-sm hover:shadow-md light-neutral">
                        <TabProvider value={value} onChange={setValue}>
                            <div className="w-full h-full">
                                    <TabList>
                                        <Tab label="Avaliações e Resenhas" icon={<StarIcon />} value='resenhas' />
                                        <Tab label="Readlists" icon={<OpenBookIcon />} value='readlists' />
                                        <Tab label="Comunidades" icon={<CommunityIcon />} value='comunidades' />
                                    </TabList>

                                    <TabPanel value='resenhas'>
                                        <div>
                                            resenhas {/*listar resenhas e avaliações*/}
                                        </div>
                                    </TabPanel>

                                    <TabPanel value='readlists'>
                                        <div className="grid grid-cols-2 overflow-y-auto">
                                            readlists
                                        </div>
                                    </TabPanel>

                                    <TabPanel value='comunidades'>
                                        <div className="grid grid-cols-2  overflow-y-auto">
                                            comunidades
                                        </div>  
                                    </TabPanel>
                            </div>
                        </TabProvider>
                    </div>
                </main>
            </div>

            <ToastNotification />
        </div>
    );
}