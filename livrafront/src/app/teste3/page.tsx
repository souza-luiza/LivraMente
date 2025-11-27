"use client";

import ProgressoLivros from "@/components/progresso-livros";
import LivrosReadlist from "@/components/livros-readlist";
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import Button from "@/components/button";
import Edit2Icon from "@/components/icons/Edit2Icon";
import HeartIcon from "@/components/icons/HeartIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { useState } from "react";
import { Readlist } from "@/types/readlist";

export default function ReadlistPage() {
    const [isOwner, setIsOwner] = useState(true);
    const [readlistInfo, setReadlistInfo] = useState<Readlist>();

    const handleRemoveBook = async (targetBookId: string) => {
        if (!readlistInfo || !isOwner || !targetBookId) return;

        //setLoadingMembers(true);

        try {
            // Remove membro da comunidade
            //await communityService.removeMember(communityInfo.nome, targetUserId);

            // Atualiza lista de membros e contagem
            //const updatedMembers = await communityService.getMembers(communityInfo.nome);
            //setMembers(updatedMembers);

        } catch (err) {

            //console.error("Erro ao remover membro da comunidade:", err);

        } finally {

            //setLoadingMembers(false);

        }
    }

    const livros = [
    {
        _id: "1",
        titulo: "O Enigma das Sombras",
        isbn: "978-3-86680-192-9",
        autores: ["Marina Silva"],
        ano_publicacao: 2018,
        sinopse: "Um suspense psicológico onde uma detetive precisa enfrentar seus próprios medos para desvendar uma série de desaparecimentos.",
        numero_paginas: 342,
        generos: ["Suspense", "Mistério"],
        editora: "Editora Horizonte"
    },
    {
        _id: "2",
        titulo: "Além das Estrelas",
        isbn: "978-1-4028-9462-6",
        autores: ["Carlos Mendonça", "Aline Torres"],
        ano_publicacao: 2021,
        sinopse: "Uma aventura de ficção científica sobre a primeira missão tripulada rumo a um exoplaneta habitável.",
        numero_paginas: 418,
        generos: ["Ficção Científica", "Aventura"],
        editora: "Galáxia Press"
    },
    {
        _id: "3",
        titulo: "Caminhos de Outono",
        isbn: "978-0-307-29136-2",
        autores: ["Helena Duarte"],
        ano_publicacao: 2015,
        sinopse: "Um romance delicado sobre reencontros, amadurecimento e a beleza das pequenas coisas.",
        numero_paginas: 276,
        generos: ["Romance", "Drama"],
        editora: "Raiz Editorial"
    },
    {
        _id: "4",
        titulo: "A Arte da Guerra Digital",
        isbn: "978-1-59327-584-6",
        autores: ["Ricardo Fonseca"],
        ano_publicacao: 2022,
        sinopse: "Um guia moderno sobre segurança cibernética e estratégias de defesa no mundo conectado.",
        numero_paginas: 331,
        generos: ["Tecnologia", "Educação"],
        editora: "CyberMind"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    {
        _id: "5",
        titulo: "Histórias que o Vento Conta",
        isbn: "978-85-7522-123-4",
        autores: ["João Figueiredo"],
        ano_publicacao: 2010,
        sinopse: "Uma coletânea de contos inspirados em lendas populares e histórias transmitidas entre gerações.",
        numero_paginas: 198,
        generos: ["Fantasia", "Folclore"],
        editora: "Aurora Editorial"
    },
    ];

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <SearchBar />

                <div className="w-full flex gap-4 p-4">
                    <div className="flex flex-col gap-2 items-center">
                        <main className="bg-[#E8DDD4] w-[240px] h-fit flex flex-col medium-border-radius p-5 gap-2 text-[var(--secondary-700)]">
                            <div className="relative w-full aspect-[1/1]">
                                <Image 
                                    src={"/ReadlistDefault.png"}
                                    alt={"Foto da readlist"}
                                    fill
                                    className="object-cover rounded-lg" 
                                />
                            </div>
                            <h3 className="text-h3 text-center break-words">Readlist</h3>
                            <div className="flex flex-row justify-center items-center gap-1">
                                <Image 
                                    src="/AbstractUser.png"
                                    alt="Foto do dono da readlist"
                                    width={24}
                                    height={24}
                                    className="rounded-full object-cover"
                                />
                                <p className="text-b2">@username</p>
                            </div>
                            <div className="flex flex-row justify-center">
                                <Button icon={<HeartIcon/>} size="medium" colorScheme="light-brown"/>
                                <Button icon={<Edit2Icon/>} size="medium" colorScheme="light-brown"/>
                            </div>
                            <ProgressoLivros lidos={2} total={5}/>
                        </main>
                        <Button icon={<OpenBookIcon/>} text={"Adicionar livro"} fullwidth={true}/>
                        <Button icon={<TrashIcon/>} text={"Apagar readlist"} fullwidth={true} variant="rejeitar"/>
                    </div>
            
                    <div className="flex flex-col gap-2">
                        <p className="text-b2 pl-4 pr-2">Em um futuro distópico na nação de Panem, a Capital obriga cada um dos 12 distritos a enviar um menino e uma menina entre 12 e 18 anos para os Jogos Vorazes. Os jovens, chamados "tributos", devem lutar até a morte em uma arena televisionada, onde apenas um sobrevivente é permitido. A trama segue Katniss Everdeen, do Distrito 12, que se oferece no lugar de sua irmã e precisa usar suas habilidades de caça e sobrevivência para vencer a competição mortal.</p>
                        <div className="w-full border-b" style={{ borderColor: '#E0E0E0' }}></div>
                        <div className="w-full grid grid-cols-8 pr-2 pl-2 pb-2">
                            {livros.map((livro) => (
                                <LivrosReadlist
                                    key={livro._id}
                                    livro={livro}
                                    isCurrentUserOwner={isOwner}
                                    handleRemoveBook={handleRemoveBook}
                                />  
                            ))}
                        </div>
                    </div>
    
                </div>

            </div>
        </div>
    )
}