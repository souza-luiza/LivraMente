import Image from "next/image";
import Link from "next/link";

export default function Readlist({ id, title, author }: { id?: string; title?: string; author?: string }) {
    return(
        <Link href={`/readlist/${id}`} className="w-full items-center flex flex-col pb-4">
            <div className="relative w-full aspect-[4/4]">
                <Image 
                    src="/Readlist.svg" 
                    alt={`Capa da Readlist ${title}`}
                    fill
                    className="object-cover rounded-lg"
                />
            </div>
            <div className="justify-center items-center text-center pt-2 w-full">
                <h4 className="text-h5 font-bold truncate">{title || "Título da Readlist"}</h4>
                <p className="text-b2 font-semibold truncate">{author || "@Autor da Readlist"}</p>
            </div>
        </Link>
    )
}