import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import ProfileIcon from "@/components/profile-icon";
import EditIcon from "@/components/icons/EditIcon";
import ProfileReadlists from "@/components/profile-readlists";
import ProfilePosts from "@/components/profile-posts";
import ProfileBadge from "@/components/profile-badge";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import SearchBar from "@/components/searchbar";
import HeartIcon from "@/components/icons/HeartIcon";
import GenreCard from "@/components/genre-card";

interface SearchPageProps {
    searchParams: Promise<{q?: string}>;
}

export default async function SearchPage({ searchParams }:SearchPageProps){
    const { q } = await searchParams;

    if (!q || q.trim() === '') {
        const genres = [
            "Romance",
            "Aventura",
            "Terror",
            "Suspense",
            "Autoajuda",
            "Fantasia",
            "Biografia",
            "Clássicos",
            "Comédia",
            "Infantil",
            "Religião",
            "Distopia",
            "Drama",
            "Mistério",
            "História",
        ];
        
        return(
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <main className="flex-1 p-4">
                    <SearchBar defaultValue={q} />
                    <div className="container">
                        <div className="m-8 w-full">
                            <h3 className="text-h3 pb-4">Gêneros</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {genres.map((genre) => (
                                    <div key={genre} className="flex justify-center">
                                        <GenreCard label={genre} href="#" Icon={HeartIcon} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 p-4">
                <SearchBar defaultValue={q} />
                <div className="container">
                    <div className="flex justify-between items-center m-8">
                        <div className="flex flex-col">
                        <Link href="#" className="flex text-h3 body-underline items-center">Melhor Resultado <ChevronRightIcon size={40}/></Link>
                        <div className="container bg-[var(--primary-700)] dark-green rounded-xl">
                            <div>
                                <div className="flex p-4">
                                </div>
                                <div className="flex flex-col p-4">
                                    <h4 className="text-h4">Jogos Vorazes</h4>
                                    <div className="flex">
                                        <h6 className="text-h6">Livro</h6>
                                        <h6 className="text-h6 ml-4">Suzanne Collins</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                
            </main>
        </div>
    )
}