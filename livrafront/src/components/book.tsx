"use client";

import Image from "next/image";
import { Livro } from "../types/livros";
import { useRouter } from "next/navigation";

interface BookCardProps {
    book: Livro;
    disabled?: boolean;
}

export default function BookCard({ book, disabled = false }: BookCardProps) {

    const router = useRouter();
    
    return (
        <button
            className="w-full flex flex-row light-neutral small-border-radius p-2 hover:cursor-pointer hover:shadow-lg disabled:cursor-default gap-2"
            onClick={() => router.push(`/livro/${book.slug}`)}
            disabled={disabled}
        >
            <div className="relative aspect-[2/3] w-24 overflow-hidden small-border-radius">
                {book.capa_url && <Image
                    src={book.capa_url}
                    alt={`Capa do livro ${book.titulo}`}
                    fill
                    className="object-cover"
                />}
            </div>
            <div className="w-3/4 flex flex-col p-2 gap-1">
                <h5 className="text-h6 overflow-hidden line-clamp-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {book.titulo}
                </h5>
                <p className="text-b2 overflow-hidden body-quotation line-clamp-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {book.autores?.map((autor) => autor.nome).join(", ")}
                </p>
                <p className="text-b3 body-semibold">{book.ano_publicacao}</p>
            </div>
        </button>
    );
}