"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { livrosService } from "@/services/livros";

import ToastNotification from "@/components/toast-notification";
import LoadingPage from "@/components/loading";
import { Livro } from "@/types/livros";

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
        <div>
            <h1>{book.titulo}</h1>
            <ToastNotification />
        </div>
    );
}