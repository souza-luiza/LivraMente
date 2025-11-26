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

export default function ComunidadesPage() {

    const [loading, setLoading] = useState(true);
    
    const filters: string[] = [];
    const [currentFilter, setCurrentFilter] = useState(filters[0]);

    useEffect(() => {

        const fetchBooks = async () => {
            try {

                // Chamar API para buscar livros
                // const livros = await ...

            } catch (error) {
                
                toast.error("Erro ao carregar os livros.");
                
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
        <div className="flex min-h-screen bg-[#E5EEDF]">
            <Sidebar />
            <main className="w-full h-full flex flex-col px-4 py-2 gap-2">
                <SearchBar backgroundcolor="#E5EEDF" divider={true} />

                <div className="w-full flex flex-row items-center justify-between">
                    <h1 className="text-h2">Livros</h1>
                    {/*<DropdownFilter 
                        filters={filters}
                        currentFilter={currentFilter}
                        onChange={() => handleChangeFilter()}
                        colorScheme="dark-brown"
                    />*/}
                </div>

                {/* Listar todos os livros */}
                <div className="w-full h-full grid grid-cols-3 gap-1 medium-border-radius small-padding shadow-sm bg-white">
                    <BookCard
                        bookCoverUrl="/CommunityDefault.png"
                        bootkTitle="A Arte da Impaciência"
                        bookAuthor="Kemi Funnycats'"
                    />
                    <BookCard
                        bookCoverUrl="/CommunityDefault.png"
                        bootkTitle="A Arte da Impaciência e Outras Histórias Para Gatos Impacientes"
                        bookAuthor="Kemi Funnycats'"
                    />
                    <BookCard
                        bookCoverUrl="/CommunityDefault.png"
                        bootkTitle="A Arte da Impaciência"
                        bookAuthor="Kemi Funnycats'"
                    />
                    <BookCard
                        bookCoverUrl="/CommunityDefault.png"
                        bootkTitle="A Arte da Impaciência"
                        bookAuthor="Kemi Funnycats'"
                    />
                    <BookCard
                        bookCoverUrl="/CommunityDefault.png"
                        bootkTitle="A Arte da Impaciência"
                        bookAuthor="Kemi Funnycats'"
                    />
                </div>
            </main>
            
            <ToastNotification />

        </div>
    )
}