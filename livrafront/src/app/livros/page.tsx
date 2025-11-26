"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Componentes
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import DropdownFilter from "@/components/filter";
import LoadingPage from "@/components/loading";
import ToastNotification from "@/components/toast-notification";
import BookCard from "@/components/book";

// Chamadas à API
import { livrosService } from "@/services/livros";

// Tipos
import { Livro } from "@/types/livros";

export default function LivrosPage() {

    const [loading, setLoading] = useState(true);
    
    const filters: string[] = [];
    const [currentFilter, setCurrentFilter] = useState(filters[0]);
    const [books, setBooks] = useState<Livro[]>([]);

    useEffect(() => {

        const fetchBooks = async () => {
            try {

                const livros = await livrosService.getBooks();
                setBooks(livros);

            } catch (error) {
                
                toast.error("Erro ao carregar livros.");
                
            } finally {

                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleChangeFilter = () => {
        // Lógica para mudar o filtro
    }

    if (loading) return <LoadingPage />;
    
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="w-full h-full flex flex-col px-4 pb-2 gap-4">
                <SearchBar divider={false} />

                <div
                    className="sticky top-13 z-40 w-full flex flex-row items-center justify-between light-neutral px-4"
                    style={{ boxShadow: '0 5px 10px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <button onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}>
                        <h1 className="text-h2">Livros</h1>
                    </button>
                    <DropdownFilter 
                        filters={filters}
                        currentFilter={currentFilter}
                        onChange={() => handleChangeFilter()}
                        colorScheme="dark-brown"
                    />
                </div>

                {/* Listar todos os livros */}
                <div
                    className="w-full h-full grid grid-cols-3 gap-1 medium-border-radius small-padding bg-gray-50"
                >
                    {books.map((book) => (
                        <BookCard key={book._id} book={book} />
                    ))}
                </div>
            </main>
            
            <ToastNotification />

        </div>
    )
}