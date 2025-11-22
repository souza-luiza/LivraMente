import { Livro } from "@/types/livro";
import Image from "next/image";
import Link from "next/link";

interface LivrosReadlistProps {
    livros: Livro[];
}

export default function LivrosReadlist({ livros = [] }: LivrosReadlistProps) {
    return (
        <div className="w-full grid grid-cols-8 pr-2 pl-2 pb-2">
            {livros.map((livro) => (
                <Link key={livro._id} href={livro.titulo} className="pr-2 pl-2 pb-2">
                    <Image 
                        src={livro.capa_url || "/team/Kemi.jpg"}
                        alt={`Capa do livro ${livro.titulo}`}
                        width={140}
                        height={160}
                        className="object-cover rounded-lg"
                    />
                </Link>
            ))}

        </div>
    );
}