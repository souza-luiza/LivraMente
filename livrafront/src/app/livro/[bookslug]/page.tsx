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
import { TabProvider, TabPanel, TabList, Tab } from "@/components/tabs";
import CommunityIcon from "@/components/icons/CommunityIcon";
import StarIcon from "@/components/icons/StarIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import ReviewComponent from "@/components/resenha";
import Button from "@/components/button";
import AddIcon from "@/components/icons/AddIcon";
import InfoIcon from "@/components/icons/InfoIcon";
import { Readlist as TypeReadlist} from "@/types/readlist";
import { Comunidade as TypeCommunity } from "@/types/comunidade";
import Readlist from "@/components/readlist";
import Comunidade from "@/components/comunidade-card";

export default function LivroPage() {
    const params = useParams();
    const { bookslug } = params as { bookslug: string };

    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<Livro>();
    const [reviews, setReviews] = useState<any[]>([]);
    const [readlists, setReadlists] = useState<TypeReadlist[]>([]);
    const [communities, setCommunities] = useState<TypeCommunity[]>([]);

    const [value, setValue] = useState('resenhas');
    
    useEffect(() => {

        async function fetchBookDetails() {
            
            try {
                // busca detalhes do livro
                const book = await livrosService.getBookBySlug(bookslug);
                setBook(book);

                // buscar avaliações e resenhas do livro
                // TODO: const reviews = await [INTEGRARA COM A PARTE DA ISABELE]
                const reviews: any[] = []; // substituir por dados reais
                setReviews(reviews);
                
                // busca readlists que contém o livro
                const readlists = await livrosService.getBookReadlists(bookslug);
                setReadlists(readlists);
                console.log(readlists);
                // busca comunidades relacionadas ao livro
                const communities = await livrosService.getBookCommunities(bookslug);
                setCommunities(communities);

            } catch (error) {

                toast.error("Erro ao carregar detalhes do livro.");

            } finally {

                setLoading(false);
            }
        }

        fetchBookDetails();

    }, [bookslug]);

    const handleRefreshReviews = async () => {
        // buscar resenhas atualizadas
    };

    if (!book) return null;
    if (loading) return <LoadingPage />;
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="w-full h-screen flex flex-col px-4 pb-2 gap-2">
                <SearchBar backgroundcolor="bg-gray-50"/>

                <main className="w-full h-full flex flex-row overflow-hidden gap-2 p-1">
                    <div className="h-full flex-1 flex flex-col gap-2">
                        <div className="flex flex-col medium-box light-neutral shadow-sm hover:shadow-md gap-2">
                            <div className="flex flex-row items-start gap-4">
                                <div className="relative aspect-[2/3] w-36 flex overflow-hidden small-border-radius hover:shadow-sm">
                                    {book.capa_url && <Image
                                        src={book.capa_url}
                                        alt={`Capa do livro ${book.titulo}`}
                                        fill
                                        className="object-cover"
                                    />}
                                </div>
                                <div className="w-full h-full flex flex-col">
                                    <h1 className="text-h4 line-clamp-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{book.titulo}</h1>
                                    <p className="text-b1 body-quotation">{book.autores?.map((autor) => autor.nome).join(", ")}</p>
                                    <div className="w-full flex flex-col gap-1">
                                        <div className="flex flex-row items-center overflow-hidden gap-1 mt-1">
                                            <div className="flex flex-shrink-0 small-box dark-green text-b3 body-semibold">
                                                {book.ano_publicacao}
                                            </div>
                                            <div className="flex flex-shrink-0 small-box dark-green text-b3 body-semibold">
                                                {book.numero_paginas} páginas
                                            </div>
                                            <div className="flex flex-shrink-0 small-box dark-green text-b3 body-semibold">
                                                ISBN: {book.isbn.match(/\d+/)?.[0] ?? "N/A"}
                                            </div>
                                        </div>
                                        {book.generos && 
                                        <div className="flex flex-row flex-wrap gap-1">
                                            {book.generos.map((genero, index) => (
                                                <div key={index} className="flex flex-shrink-0 small-box items-center light-green text-b3 gap-1">
                                                    {genero.toLowerCase()}
                                                    <InfoIcon size={12} />
                                                </div>
                                            ))}
                                        </div>}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-row gap-1">
                                <Button
                                    text="Adicionar a Readlist"
                                    icon={<AddIcon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                    fullwidth={true}
                                />
                                <Button
                                    text="Avaliar e Resenhar"
                                    icon={<StarIcon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                    fullwidth={true}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col medium-box light-neutral shadow-sm hover:shadow-md gap-1 overflow-y-auto">
                            <h6 className="text-h5 mb-1">Sinopse</h6>
                            <p className="text-b2 text-justify pr-1 overflow-y-auto">{book.sinopse ?? <span className="flex text-b1 body-quotation justify-center">Este livro não possui sinopse.</span>}</p>
                        </div>
                    </div>
                    <div className="h-full flex-1 flex medium-box shadow-sm hover:shadow-md light-neutral">
                        <TabProvider value={value} onChange={setValue}>
                            <div className="w-full h-full overflow-y-auto">
                                    <TabList className="sticky top-0 light-neutral">
                                        <Tab label="Avaliações e Resenhas" icon={<StarIcon />} value='resenhas' />
                                        <Tab label="Readlists" icon={<OpenBookIcon />} value='readlists' />
                                        <Tab label="Comunidades" icon={<CommunityIcon />} value='comunidades' />
                                    </TabList>

                                    <TabPanel value='resenhas'>
                                        {reviews.length > 0 ? (
                                        <div className="flex flex-col gap-2 pb-2 pr-1 overflow-y-auto">
                                            {/* TODO: mudar essa lógica aqui */}
                                            {reviews.map((review) => (
                                                <ReviewComponent
                                                    key={review._id}
                                                    onDelete={handleRefreshReviews}
                                                    onUpdate={handleRefreshReviews}
                                                />
                                            ))}
                                        </div>
                                        ) : (
                                        <span className="flex text-b1 body-quotation justify-center mt-4">
                                            Não há nenhuma avaliação ou resenha para este livro.
                                        </span>
                                        )}
                                    </TabPanel>

                                    <TabPanel value='readlists'>
                                        {readlists.length > 0 ? (
                                        <div className="grid grid-cols-4 overflow-y-auto">
                                            {readlists.map((readlist) => (
                                                <Readlist 
                                                    key={readlist._id}
                                                    title={readlist.nome}
                                                    author={readlist.criador.username}
                                                    image={readlist.capa_url}
                                                    link={`/${readlist.criador.username}/readlist/${readlist.slug}`}
                                                />
                                            ))}
                                        </div>
                                        ) :(
                                        <span className="flex text-b1 body-quotation justify-center mt-4">
                                            Esse livro não está em nenhuma readlist.
                                        </span>
                                        )}  
                                    </TabPanel>

                                    <TabPanel value='comunidades'>
                                        {communities.length > 0 ? (
                                        <div className="grid grid-cols-2  overflow-y-auto">
                                            {communities.map((community) => (
                                                <Comunidade
                                                    key={community._id}
                                                    id={community._id}
                                                    nome={community.nome}
                                                    descricao={community.descricao}
                                                    image={community.capaUrl}
                                                />
                                            ))}
                                        </div>
                                        ) : (
                                        <span className="flex text-b1 body-quotation justify-center mt-4">
                                            Esse livro não está associado a nenhuma comunidade.
                                        </span>
                                        )}  
                                    </TabPanel>
                            </div>
                        </TabProvider>
                    </div>
                </main>
            </div>

            <ToastNotification />
        </div>
    );
}