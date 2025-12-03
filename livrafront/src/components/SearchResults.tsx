"use client";

import Link from "next/link";
import Image from "next/image";
import ChevronRightIcon from "./icons/ChevronRightIcon";

interface Book {
    id: string;
    title: string;
    author: string;
    href: string;
    numberOfPages: number;
    imageSrc: string;
}

interface User {
    id: string;
    username: string;
    avatarUrl: string;
}

interface Community {
    id: string;
    name: string;
    coverImageUrl: string;
}

interface Readlist {
    title: string;
    author: string;
    image: string;
    link: string;
}

interface SearchResultsProps {
    query: string;
    books?: Book[];
    users?: User[];
    communities?: Community[];
    readlists?: Readlist[];
    bestMatch?: {
        type: "book" | "user" | "community" | "readlist";
        data: Book | User | Community | Readlist;
    };
}

// Componente para resultado de livro (retangular)
function BookResult({ book, size = "small" }: { book: Book; size?: "small" | "large" }) {
    if (size === "large") {
        return (
            <Link
                href={book.href}
                className="flex flex-col sm:flex-row p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4"
            >
                <div className="flex-shrink-0 w-full sm:w-auto h-[200px]">
                    <Image
                        className="rounded-lg h-full w-full sm:w-auto object-cover"
                        src={book.imageSrc}
                        alt={book.title}
                        width={140}
                        height={200}
                    />
                </div>
                <div className="flex flex-col justify-between overflow-hidden">
                    <h4 className="text-h4 line-clamp-3 mt-2">{book.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                        <span className="text-h6 brightness-90">Livro</span>
                        <span className="text-h6 brightness-90">•</span>
                        <span className="text-h6 brightness-90">{book.author}</span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={book.href}
            className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 transition-all"
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
            <span className="text-b3 text-gray-500">{book.numberOfPages} págs.</span>
        </Link>
    );
}

// Componente para resultado de usuário (circular)
function UserResult({ user, size = "small" }: { user: User; size?: "small" | "large" }) {
    if (size === "large") {
        return (
            <Link
                href={`/${user.username.replace("@", "")}`}
                className="flex items-center p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4"
            >
                <div className="w-24 h-24 flex-shrink-0">
                    <Image
                        className="rounded-full object-cover w-full h-full"
                        src={user.avatarUrl}
                        alt={user.username}
                        width={96}
                        height={96}
                    />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-h4">{user.username}</h4>
                    <span className="text-h6 brightness-90">Usuário</span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/${user.username.replace("@", "")}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
        >
            <div className="w-10 h-10 flex-shrink-0">
                <Image
                    className="rounded-full object-cover w-full h-full"
                    src={user.avatarUrl}
                    alt={user.username}
                    width={40}
                    height={40}
                />
            </div>
            <span className="text-h6 text-black truncate">{user.username}</span>
        </Link>
    );
}

// Componente para resultado de comunidade (circular)
function CommunityResult({ community, size = "small" }: { community: Community; size?: "small" | "large" }) {
    if (size === "large") {
        return (
            <Link
                href={`/comunidade/${community.id}`}
                className="flex items-center p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4"
            >
                <div className="w-24 h-24 flex-shrink-0">
                    <Image
                        className="rounded-full object-cover w-full h-full"
                        src={community.coverImageUrl}
                        alt={community.name}
                        width={96}
                        height={96}
                    />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-h4">{community.name}</h4>
                    <span className="text-h6 brightness-90">Comunidade</span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/comunidade/${community.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
        >
            <div className="w-10 h-10 flex-shrink-0">
                <Image
                    className="rounded-full object-cover w-full h-full"
                    src={community.coverImageUrl}
                    alt={community.name}
                    width={40}
                    height={40}
                />
            </div>
            <span className="text-h6 text-black truncate">{community.name}</span>
        </Link>
    );
}

// Componente para resultado de readlist (quadrada)
function ReadlistResult({ readlist, size = "small" }: { readlist: Readlist; size?: "small" | "large" }) {
    if (size === "large") {
        return (
            <Link
                href={readlist.link}
                className="flex items-center p-4 bg-[var(--primary-700)] dark-green rounded-xl hover:brightness-90 transition-all gap-4"
            >
                <div className="w-24 h-24 flex-shrink-0">
                    <Image
                        className="rounded-lg object-cover w-full h-full"
                        src={readlist.image}
                        alt={readlist.title}
                        width={96}
                        height={96}
                    />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-h4">{readlist.title}</h4>
                    <span className="text-h6 brightness-90">Readlist • {readlist.author}</span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={readlist.link}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
        >
            <div className="w-12 h-12 flex-shrink-0">
                <Image
                    className="rounded-lg object-cover w-full h-full"
                    src={readlist.image}
                    alt={readlist.title}
                    width={48}
                    height={48}
                />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-h6 text-black truncate">{readlist.title}</span>
                <span className="text-b3 text-gray-600 truncate">{readlist.author}</span>
            </div>
        </Link>
    );
}

// Componente para renderizar o melhor resultado baseado no tipo
function BestMatchResult({ bestMatch }: { bestMatch: SearchResultsProps["bestMatch"] }) {
    if (!bestMatch) return null;

    switch (bestMatch.type) {
        case "book":
            return <BookResult book={bestMatch.data as Book} size="large" />;
        case "user":
            return <UserResult user={bestMatch.data as User} size="large" />;
        case "community":
            return <CommunityResult community={bestMatch.data as Community} size="large" />;
        case "readlist":
            return <ReadlistResult readlist={bestMatch.data as Readlist} size="large" />;
        default:
            return null;
    }
}

export default function SearchResults({
    query,
    books = [],
    users = [],
    communities = [],
    readlists = [],
    bestMatch,
}: SearchResultsProps) {
    const hasBooks = books.length > 0;
    const hasUsers = users.length > 0;
    const hasCommunities = communities.length > 0;
    const hasReadlists = readlists.length > 0;
    const hasResults = hasBooks || hasUsers || hasCommunities || hasReadlists;

    if (!hasResults) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-h4 text-gray-500">Nenhum resultado encontrado para "{query}"</p>
                <p className="text-b1 text-gray-400 mt-2">Tente buscar por outro termo</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Melhor Resultado + Resultados Relacionados */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Melhor Resultado */}
                {bestMatch && (
                    <div className="flex flex-col w-full lg:w-1/2">
                        <Link href="#" className="flex text-h3 body-underline items-center pb-4">
                            Melhor Resultado <ChevronRightIcon size={40} />
                        </Link>
                        <BestMatchResult bestMatch={bestMatch} />
                    </div>
                )}

                {/* Resultados Mistos (lado direito) */}
                <div className="flex flex-col w-full lg:w-1/2">
                    <h4 className="text-h4 pb-4">Resultados Relacionados</h4>
                    <div className="flex flex-col gap-2 bg-white p-4 rounded-xl max-h-[300px] overflow-y-auto">
                        {books.slice(0, 2).map((book) => (
                            <BookResult key={book.id} book={book} />
                        ))}
                        {users.slice(0, 2).map((user) => (
                            <UserResult key={user.id} user={user} />
                        ))}
                        {communities.slice(0, 2).map((community) => (
                            <CommunityResult key={community.id} community={community} />
                        ))}
                        {readlists.slice(0, 2).map((readlist) => (
                            <ReadlistResult key={readlist.title} readlist={readlist} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Seções por Tipo */}
            {hasBooks && (
                <div className="flex flex-col">
                    <Link href={`/busca/livros?q=${query}`} className="flex text-h4 body-underline items-center pb-4">
                        Livros <ChevronRightIcon size={32} />
                    </Link>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {books.slice(0, 5).map((book) => (
                            <Link
                                key={book.id}
                                href={book.href}
                                className="flex flex-col bg-white rounded-xl p-3 hover:shadow-md transition-all"
                            >
                                <div className="w-full aspect-[2/3] mb-2">
                                    <Image
                                        className="rounded-lg object-cover w-full h-full"
                                        src={book.imageSrc}
                                        alt={book.title}
                                        width={140}
                                        height={210}
                                    />
                                </div>
                                <span className="text-h6 text-black line-clamp-2">{book.title}</span>
                                <span className="text-b3 text-gray-600 truncate">{book.author}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {hasUsers && (
                <div className="flex flex-col">
                    <Link href={`/busca/usuarios?q=${query}`} className="flex text-h4 body-underline items-center pb-4">
                        Usuários <ChevronRightIcon size={32} />
                    </Link>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {users.slice(0, 8).map((user) => (
                            <Link
                                key={user.id}
                                href={`/${user.username.replace("@", "")}`}
                                className="flex flex-col items-center min-w-[100px] p-3 hover:bg-white rounded-xl transition-all"
                            >
                                <div className="w-16 h-16 mb-2">
                                    <Image
                                        className="rounded-full object-cover w-full h-full"
                                        src={user.avatarUrl}
                                        alt={user.username}
                                        width={64}
                                        height={64}
                                    />
                                </div>
                                <span className="text-b2 text-black text-center truncate w-full">
                                    {user.username}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {hasCommunities && (
                <div className="flex flex-col">
                    <Link href={`/busca/comunidades?q=${query}`} className="flex text-h4 body-underline items-center pb-4">
                        Comunidades <ChevronRightIcon size={32} />
                    </Link>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {communities.slice(0, 8).map((community) => (
                            <Link
                                key={community.id}
                                href={`/comunidade/${community.id}`}
                                className="flex flex-col items-center min-w-[100px] p-3 hover:bg-white rounded-xl transition-all"
                            >
                                <div className="w-16 h-16 mb-2">
                                    <Image
                                        className="rounded-full object-cover w-full h-full"
                                        src={community.coverImageUrl}
                                        alt={community.name}
                                        width={64}
                                        height={64}
                                    />
                                </div>
                                <span className="text-b2 text-black text-center truncate w-full">
                                    {community.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {hasReadlists && (
                <div className="flex flex-col">
                    <Link href={`/busca/readlists?q=${query}`} className="flex text-h4 body-underline items-center pb-4">
                        Readlists <ChevronRightIcon size={32} />
                    </Link>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {readlists.slice(0, 6).map((readlist) => (
                            <Link
                                key={readlist.title}
                                href={readlist.link}
                                className="flex flex-col bg-white rounded-xl p-3 hover:shadow-md transition-all"
                            >
                                <div className="w-full aspect-square mb-2">
                                    <Image
                                        className="rounded-lg object-cover w-full h-full"
                                        src={readlist.image}
                                        alt={readlist.title}
                                        width={120}
                                        height={120}
                                    />
                                </div>
                                <span className="text-h6 text-black line-clamp-2">{readlist.title}</span>
                                <span className="text-b3 text-gray-600 truncate">{readlist.author}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}