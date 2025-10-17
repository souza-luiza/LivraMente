import Image from "next/image";
import Link from "next/link";

export default function Readlist({ id, title, author }: { id?: string; title?: string; author?: string }) {
    return(
        <Link href={`/readlist/${id}`} className="w-fit items-center flex flex-col">
            <Image src="Readlist.svg" alt="Capa da Readlist {title}" className="flex flex-col w-full p-2" width={160} height={160} />
            <div className="justify-center items-center text-center pt-2">
                <h4 className="text-b2 font-bold">{title || "Título da Readlist"}</h4>
                <p className="text-b3 font-bold">{author || "Autor da Readlist"}</p>
            </div>
        </Link>
    )
}