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

export default function LivroPage() {
    const params = useParams();
    const { bookslug } = params as { bookslug: string };

    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<Livro>();
    
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
        <div className="flex min-h-screen light-neutral">
            <Sidebar />

            <div className="w-full h-screen flex flex-col px-4 pb-2 gap-2">
                <SearchBar />

                <main className="w-full h-full flex flex-row gap-2">
                    <div className="w-3/5 h-full flex flex-col">
                        <div className="w-full h-1/2 flex flex-row items-center gap-4">
                            <div className="relative aspect-[2/3] w-1/5 flex overflow-hidden small-border-radius">
                                {book.capa_url && <Image
                                    src={book.capa_url}
                                    alt={`Capa do livro ${book.titulo}`}
                                    fill
                                    className="object-cover"
                                />}
                            </div>
                            <div className="w-4/5 flex flex-col gap-1">
                                <h1 className="text-h4" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{book.titulo}</h1>
                                <h2 className="text-b1 body-quotation"><span className="text-b2">por </span>{book.autores?.map((autor) => autor.nome).join(", ")}</h2>
                            </div>
                        </div>
                        <div className="w-full h-1/2">
                            <p className="text-b3">Tabs de Readlists e Comunidades Relacionadas</p>
                        </div>
                    </div>
                    <div className="w-2/5 h-full flex items-center justify-center bg-gray-100">
                        <p className="text-b3">Resenhas e Avaliações</p>
                    </div>
                </main>
            </div>

            <ToastNotification />
        </div>
    );
}