import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import { useEffect } from "react";

export default function PostPage() {
    const params = useParams();
    const { postId } = params as { postId: string }

    useEffect(() => {
        
    }, [])

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar />

                {/*Conteúdo Principal da Página*/}
                <main className="w-full pl-2 pr-4 py-2">
                    {/*Header: Comunidade + Usuário*/}
                    {/*Post*/}
                    {/*Seção de Comentários*/}
                    {/*Seção Direita - Recomendações, Chatbot etc...*/}
                </main>
            </div>
        </div>
    );
}