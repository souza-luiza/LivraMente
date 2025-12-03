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
import FilterIcon from "@/components/icons/FilterIcon";
import ClockIcon from "@/components/icons/ClockIcon";
import PillarIcon from "@/components/icons/PillarIcon";
import Button from "@/components/button";
import ArrowUpIcon from "@/components/icons/ArrowUpIcon";

export default function LivrosPage() {

    const [loading, setLoading] = useState(true);
    
    const filters: string[] = ['A-Z Título', 'Z-A Título', 'A-Z Autor', 'Z-A Autor', 'Mais Recentes', 'Mais Antigos'];
    const [currentFilter, setCurrentFilter] = useState(filters[0]);
    const [books, setBooks] = useState<Livro[]>([]);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);

    useEffect(() => {

        const fetchBooks = async () => {
            try {

                const livros = await livrosService.getBooks();
                const sortedBooks = livros.sort((a, b) => a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase()));
                setBooks(sortedBooks);

            } catch (error) {
                
                toast.error("Erro ao carregar livros.");
                
            } finally {

                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const mainHeader = document.querySelector('.books-header');
            if (!mainHeader) return;
            const rect = mainHeader.getBoundingClientRect();
            setShowScrollTopButton(rect.bottom <= 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setBooks(sortBooks());
    }, [currentFilter]);

    const sortBooks = () => {

        const sortedBooks = [...books].sort((a, b) => {
            if (currentFilter === "A-Z Título") {
                return a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase());
            } else if (currentFilter === 'Z-A Título') {
                return b.titulo.toLowerCase().localeCompare(a.titulo.toLowerCase());
            } else if (currentFilter === 'A-Z Autor') {
                return a.autores[0]?.nome.toLowerCase().localeCompare(b.autores[0]?.nome.toLowerCase());
            } else if (currentFilter === 'Z-A Autor') {
                return b.autores[0]?.nome.toLowerCase().localeCompare(a.autores[0]?.nome.toLowerCase());
            } else if (currentFilter === 'Mais Recentes') {
                return b.ano_publicacao - a.ano_publicacao;
            } else if (currentFilter === 'Mais Antigos') {
                return a.ano_publicacao - b.ano_publicacao;
            }
            return 0;
        });

        return sortedBooks;
    };

    if (loading) return <LoadingPage />;
    
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="w-full h-full flex flex-col px-4 pb-2 gap-2">
                <SearchBar />

                {showScrollTopButton &&
                <div className="sticky top-16 flex justify-center z-30 ">
                    <Button
                        text="Voltar ao Topo"
                        icon={<ArrowUpIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    />
                </div>}

                <div className="w-full flex flex-row items-center justify-between light-neutral px-4 books-header">
                    <h1 className="text-h2">Livros</h1>
                    <DropdownFilter 
                        filters={filters}
                        filterIcons={[
                            <FilterIcon key='filter-1' />,
                            <FilterIcon key='filter-2' />,
                            <FilterIcon key='filter-3' />,
                            <FilterIcon key='filter-4' />,
                            <ClockIcon key='filter-clock' />,
                            <PillarIcon key='filter-pillar' />
                        ]}
                        currentFilter={currentFilter}
                        onChange={setCurrentFilter}
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