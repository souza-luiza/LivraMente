import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import SearchBar from "@/components/searchbar";
import HeartIcon from "@/components/icons/HeartIcon";
import GenreCard from "@/components/genre-card";
import AdventureIcon from "@/components/icons/AdventureIcon";
import TerrorIcon from "@/components/icons/TerrorIcon";
import SuspenseIcon from "@/components/icons/SuspenseIcon";
import HelpIcon from "@/components/icons/HelpIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import ComedyIcon from "@/components/icons/ComedyIcon";
import DystopiaIcon from "@/components/icons/DystopiaIcon";
import DramaIcon from "@/components/icons/DramaIcon";
import MysteryIcon from "@/components/icons/MysteryIcon";
import ReadlistCarousel from "@/components/readlist-carousel";
import CommunitiesCarousel from "@/components/communities-carousel";
import UsersCarousel from "@/components/users-carousel";

interface SearchPageProps {
    searchParams: Promise<{q?: string}>;
}

// Tipos para os resultados
type ResultType = "book" | "user" | "community" | "readlist";

interface RelatedResult {
    type: ResultType;
    title: string;
    subtitle: string;
    href: string;
    imageSrc: string;
    extra?: string; // número de páginas, membros, etc.
}

export default async function SearchPage({ searchParams }:SearchPageProps){
    const { q } = await searchParams;

    if (!q || q.trim() === '') {
        const genres = [
            { name: "Romance", icon: HeartIcon },
            { name: "Aventura", icon: AdventureIcon },
            { name: "Terror", icon: TerrorIcon },
            { name: "Suspense", icon: SuspenseIcon },
            { name: "Autoajuda", icon: HelpIcon },
            { name: "Fantasia", icon: HeartIcon },
            { name: "Biografia", icon: OpenBookIcon },
            { name: "Clássicos", icon: HeartIcon },
            { name: "Comédia", icon: ComedyIcon },
            { name: "Infantil", icon: HeartIcon },
            { name: "Religião", icon: HeartIcon },
            { name: "Distopia", icon: DystopiaIcon },
            { name: "Drama", icon: DramaIcon },
            { name: "Mistério", icon: MysteryIcon },
            { name: "História", icon: HeartIcon },
        ];
        
        return(
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <main className="w-full flex flex-col flex-1 p-2 overflow-x-hidden">
                    <SearchBar defaultValue={q} />
                    <div className="flex w-full">
                        <div className="m-8 w-full">
                            <h3 className="text-h3 pb-4">Gêneros</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
                                {genres.map((genre) => (
                                    <div key={genre.name} className="flex justify-center">
                                        <GenreCard label={genre.name} href="#" Icon={genre.icon} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Melhor resultado (pode ser qualquer tipo)
    const bestMatch = {
        type: "book" as ResultType,
        title: "Jogos Vorazes",
        subtitle: "Suzanne Collins",
        href: "#",
        imageSrc: "/JogosVorazes.jpg",
    };

    // Resultados relacionados mistos
    const relatedResults: RelatedResult[] = [
        { 
            type: "book",
            title: "Livro Exemplo 1", 
            subtitle: "Autor Exemplo 1", 
            href: "#", 
            imageSrc: "/JogosVorazes.jpg",
            extra: "400 págs."
        },
        { 
            type: "user",
            title: "@UserExemplo1", 
            subtitle: "Usuário", 
            href: "#", 
            imageSrc: "/AbstractUser.png",
        },
        { 
            type: "community",
            title: "Comunidade Exemplo 1", 
            subtitle: "1.2k membros", 
            href: "#", 
            imageSrc: "/Readlist.svg",
        },
        { 
            type: "readlist",
            title: "Readlist Exemplo 1", 
            subtitle: "@AutorReadlist1", 
            href: "#", 
            imageSrc: "/Readlist.svg",
            extra: "12 livros"
        },
    ];

    const relatedReadlists = [
        { title: "Readlist Exemplo 1", author: "@AutorReadlist1", image: "/Readlist.svg", link: "/AutorReadlist1/ReadlistExemplo1" },
        { title: "Readlist Exemplo 2", author: "@AutorReadlist2", image: "/Readlist.svg", link: "/AutorReadlist2/ReadlistExemplo2" },
        { title: "Readlist Exemplo 3", author: "@AutorReadlist3", image: "/Readlist.svg", link: "/AutorReadlist3/ReadlistExemplo3" },
        { title: "Readlist Exemplo 4", author: "@AutorReadlist4", image: "/Readlist.svg", link: "/AutorReadlist4/ReadlistExemplo4" },
        { title: "Readlist Exemplo 5", author: "@AutorReadlist6", image: "/Readlist.svg", link: "/AutorReadlist5/ReadlistExemplo5" },
        { title: "Readlist Exemplo 6", author: "@AutorReadlist5", image: "/Readlist.svg", link: "/AutorReadlist6/ReadlistExemplo6" },
        { title: "Readlist Exemplo 7", author: "@AutorReadlist7", image: "/Readlist.svg", link: "/AutorReadlist7/ReadlistExemplo7" },
        { title: "Readlist Exemplo 8", author: "@AutorReadlist8", image: "/Readlist.svg", link: "/AutorReadlist8/ReadlistExemplo8" }
    ];

    const relatedUsers = [
        { id: "1", username: "@UserExemplo1", avatarUrl: "/AbstractUser.png" },
        { id: "2", username: "@UserExemplo2", avatarUrl: "/AbstractUser.png" },
        { id: "3", username: "@UserExemplo3", avatarUrl: "/AbstractUser.png" },
        { id: "4", username: "@UserExemplo4", avatarUrl: "/AbstractUser.png" },
        { id: "5", username: "@UserExemplo5", avatarUrl: "/AbstractUser.png" },
        { id: "6", username: "@UserExemplo6", avatarUrl: "/AbstractUser.png" },
        { id: "7", username: "@UserExemplo7", avatarUrl: "/AbstractUser.png" },
        { id: "8", username: "@UserExemplo8", avatarUrl: "/AbstractUser.png" },
    ];

    const relatedCommunities = [
        { id: "1", name: "Comunidade Exemplo 1", coverImageUrl: "/Readlist.svg" },
        { id: "2", name: "Comunidade Exemplo 2", coverImageUrl: "/Readlist.svg" },
        { id: "3", name: "Comunidade Exemplo 3", coverImageUrl: "/Readlist.svg" },
        { id: "4", name: "Comunidade Exemplo 4", coverImageUrl: "/Readlist.svg" },
        { id: "5", name: "Comunidade Exemplo 5", coverImageUrl: "/Readlist.svg" },
        { id: "6", name: "Comunidade Exemplo 6", coverImageUrl: "/Readlist.svg" },
        { id: "7", name: "Comunidade Exemplo 7", coverImageUrl: "/Readlist.svg" },
        { id: "8", name: "Comunidade Exemplo 8", coverImageUrl: "/Readlist.svg" },
    ];

    // Função para obter o label do tipo
    const getTypeLabel = (type: ResultType) => {
        switch (type) {
            case "book": return "Livro";
            case "user": return "Usuário";
            case "community": return "Comunidade";
            case "readlist": return "Readlist";
        }
    };

    // Função para determinar o formato da imagem
    const getImageClasses = (type: ResultType) => {
        switch (type) {
            case "book": return "w-12 h-16 rounded-lg"; // Retangular
            case "user": 
            case "community": return "w-12 h-12 rounded-full"; // Circular
            case "readlist": return "w-12 h-12 rounded-lg"; // Quadrada
        }
    };

    // Função para determinar o formato da imagem do melhor resultado
    const getBestMatchImageClasses = (type: ResultType) => {
        switch (type) {
            case "book": return "h-[248px] w-auto rounded-lg";
            case "user": 
            case "community": return "w-[200px] h-[200px] rounded-full";
            case "readlist": return "w-[200px] h-[200px] rounded-lg";
        }
    };

    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="w-full flex flex-col flex-1 p-2 overflow-x-hidden">
                <SearchBar defaultValue={q} />
                <div className="flex flex-col lg:flex-row gap-4 m-8">
                    <div className="flex flex-col w-full lg:w-1/2">
                        <Link href="#" className="flex text-h3 body-underline items-center pb-4">
                            Melhor Resultado <ChevronRightIcon size={40}/>
                        </Link>
                        
                        <Link 
                            href={bestMatch.href} 
                            className="flex flex-col sm:flex-row p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4 relative group"
                        >
                            <div className={`flex-shrink-0 ${bestMatch.type === "book" ? "w-full sm:w-auto" : "flex items-center justify-center"}`}>
                                <Image 
                                    className={`${getBestMatchImageClasses(bestMatch.type)} object-cover`}
                                    src={bestMatch.imageSrc} 
                                    alt={bestMatch.title} 
                                    width={bestMatch.type === "book" ? 140 : 200} 
                                    height={bestMatch.type === "book" ? 248 : 200}
                                />
                            </div>
                            
                            <div className="flex flex-col justify-between overflow-hidden">
                                <h4 className="text-h4 line-clamp-3 mt-2 hover:underline">
                                    {bestMatch.title}
                                </h4>
                                
                                <div className="flex flex-wrap gap-2 mb-2 items-center">
                                    <span className="text-h6 brightness-90" style={{fontWeight: "lighter"}}>
                                        {getTypeLabel(bestMatch.type)}
                                    </span>
                                    <span className="text-h6 brightness-90">•</span>
                                    <span className="text-h6 brightness-90 hover:brightness-100 hover:underline cursor-pointer">
                                        {bestMatch.subtitle}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="flex flex-col w-full lg:w-1/2">
                        <h4 className="flex text-h4 items-center pb-6">Resultados Relacionados</h4>
                        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl">
                            {relatedResults.map((result, index) => (
                                <Link 
                                    key={`${result.type}-${index}`}
                                    href={result.href} 
                                    className="flex items-center gap-4 p-1 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    <div className={`${getImageClasses(result.type)} flex-shrink-0 overflow-hidden`}>
                                        <Image 
                                            className="object-cover w-full h-full"
                                            src={result.imageSrc} 
                                            alt={result.title} 
                                            width={48}
                                            height={result.type === "book" ? 64 : 48}
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-h6 text-black truncate">{result.title}</span>
                                        <span className="text-b2 text-gray-600 truncate">
                                            {getTypeLabel(result.type)} • {result.subtitle}
                                        </span>
                                    </div>
                                    {result.extra && (
                                        <div className="flex-shrink-0">
                                            <span className="font-semibold text-gray-700 text-sm">{result.extra}</span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full mt-8 mx-4 md:mx-8 pr-4 md:pr-8">
                    <Link className="flex items-center text-h3 body-underline pb-4" href="#">
                        Readlists Relacionadas <ChevronRightIcon size={40}/>
                    </Link>
                    <ReadlistCarousel readlists={relatedReadlists} />
                </div>
                <div className="w-full mt-8 mx-4 md:mx-8 pr-4 md:pr-8">
                    <Link className="flex items-center text-h3 body-underline pb-4" href="#">
                        Pessoas <ChevronRightIcon size={40}/>
                    </Link>
                    <UsersCarousel users={relatedUsers} />
                </div>                
                <div className="w-full mt-8 mx-4 md:mx-8 pr-4 md:pr-8">
                    <Link className="flex items-center text-h3 body-underline pb-4" href="#">
                        Comunidades Relacionadas <ChevronRightIcon size={40}/>
                    </Link>
                    <CommunitiesCarousel communities={relatedCommunities} />
                </div>
            </main>
        </div>
    )
}