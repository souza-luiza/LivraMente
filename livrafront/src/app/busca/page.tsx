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

interface SearchPageProps {
    searchParams: Promise<{q?: string}>;
}

export default async function SearchPage({ searchParams }:SearchPageProps){
    const { q } = await searchParams;

    if (!q || q.trim() === '') {
        const genres = [
            {
                name: "Romance", 
                icon: HeartIcon
            },
            {
                name: "Aventura",
                icon: AdventureIcon
            },
            {
                name: "Terror",
                icon: TerrorIcon
            },
            {
                name: "Suspense",
                icon: SuspenseIcon
            },
            {
                name: "Autoajuda",
                icon: HelpIcon
            },
            {
                name: "Fantasia",
                icon: HeartIcon // Falta o UnicornIcon
            },
            {
                name: "Biografia",
                icon: OpenBookIcon
            },
            {
                name: "Clássicos",
                icon: HeartIcon // Falta o ClassicIcon
            },
            {
                name: "Comédia",
                icon: ComedyIcon
            },
            {
                name: "Infantil",
                icon: HeartIcon // Falta o ChildIcon
            },
            {
                name: "Religião",
                icon: HeartIcon // Falta o ReligionIcon
            },
            {
                name: "Distopia",
                icon: DystopiaIcon
            },
            {
                name: "Drama",
                icon: DramaIcon
            },
            {
                name: "Mistério",
                icon: MysteryIcon
            },
            {
                name: "História",
                icon: HeartIcon // Falta o HistoryIcon
            },
        ];
        
        return(
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <main className="flex-1 p-4 h-100vh">
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

    const relatedBooks = [
        { 
            title: "Livro Exemplo 1", 
            author: "Autor Exemplo 1", 
            href: "#", 
            numberOfPages: 400,
            imageSrc: "/JogosVorazes.jpg"
        },
        { 
            title: "Livro Exemplo 2", 
            author: "Autor Exemplo 2", 
            href: "#", 
            numberOfPages: 350,
            imageSrc: "/JogosVorazes.jpg"
        },
        { 
            title: "Livro Exemplo 3", 
            author: "Autor Exemplo 3", 
            href: "#", 
            numberOfPages: 280,
            imageSrc: "/JogosVorazes.jpg"
        },
    ];

    const relatedReadlists = [
        { 
            id: "1", 
            title: "Readlist Exemplo 1", 
            author: "@AutorReadlist1", 
            image: "/Readlist.svg" 
        },
        { 
            id: "2", 
            title: "Readlist Exemplo 2", 
            author: "@AutorReadlist2", 
            image: "/Readlist.svg" 
        },
        { 
            id: "3", 
            title: "Readlist Exemplo 3", 
            author: "@AutorReadlist3", 
            image: "/Readlist.svg" 
        },
        { 
            id: "4", 
            title: "Readlist Exemplo 4", 
            author: "@AutorReadlist4", 
            image: "/Readlist.svg" 
        },
        { 
            id: "5", 
            title: "Readlist Exemplo 5", 
            author: "@AutorReadlist6", 
            image: "/Readlist.svg" 
        },
        { 
            id: "6", 
            title: "Readlist Exemplo 6", 
            author: "@AutorReadlist5", 
            image: "/Readlist.svg" 
        },
        {
            id: "7",
            title: "Readlist Exemplo 7", 
            author: "@AutorReadlist7", 
            image: "/Readlist.svg" 
        },
        {
            id: "8",
            title: "Readlist Exemplo 8",
            author: "@AutorReadlist8",
            image: "/Readlist.svg"
        }
    ]

    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="w-full flex flex-col flex-1 p-4 overflow-x-hidden">
                <SearchBar defaultValue={q} />
                <div className="flex flex-col lg:flex-row gap-4 m-8">
                    <div className="flex flex-col w-full lg:w-1/2">
                        <Link href="#" className="flex text-h3 body-underline items-center pb-4">
                            Melhor Resultado <ChevronRightIcon size={40}/>
                        </Link>
                        
                        <Link 
                            href="#" 
                            className="flex flex-col sm:flex-row p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4 relative group"
                        >
                            <div className="flex-shrink-0 w-full sm:w-auto h-[248px]"> {/*Mesmo tamanho do Livros Relacionados*/}
                                <Image 
                                    className="rounded-lg h-full w-full sm:w-auto object-cover" 
                                    src="/JogosVorazes.jpg" 
                                    alt="Jogos Vorazes" 
                                    width={140} 
                                    height={160}
                                />
                            </div>
                            
                            <div className="flex flex-col justify-between overflow-hidden">
                                <h4 className="text-h4 line-clamp-3 mt-2 hover:underline">
                                    Jogos Vorazes ahindhusa hansfuas iuansdia isdnaion ndadia ndian unadywbm asas
                                </h4>
                                
                                <div className="flex flex-wrap gap-2 mb-2 items-center">
                                    <span className="text-h6 brightness-90" style={{fontWeight: "lighter"}}>Livro</span>
                                    <span className="text-h6 brightness-90">•</span>
                                    <span className="text-h6 brightness-90 hover:brightness-100 hover:underline cursor-pointer">
                                        Suzanne Collins
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="flex flex-col w-full lg:w-1/2">
                        <h4 className="flex text-h4 items-center pb-6">Livros Relacionados</h4>
                        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl">
                            {relatedBooks.map((book) => (
                                <Link 
                                    key={book.title}
                                    href={book.href} 
                                    className="flex items-center gap-4 p-1 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    <div className="w-12 h-16 flex-shrink-0">
                                        <Image 
                                            className="rounded-lg object-cover w-full h-full"
                                            src={book.imageSrc} 
                                            alt={book.title} 
                                            width={48}
                                            height={64}
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-h6 text-black truncate">{book.title}</span>
                                        <span className="text-b2 text-gray-600 truncate">{book.author}</span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="font-semibold text-gray-700 text-sm">{book.numberOfPages} págs.</span>
                                    </div>
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
                        Comunidades Relacionadas <ChevronRightIcon size={40}/>
                    </Link>
                    <ReadlistCarousel readlists={relatedReadlists} />
                </div>
            </main>
        </div>
    )
}