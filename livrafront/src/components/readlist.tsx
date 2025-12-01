import Image from "next/image";
import Link from "next/link";

export default function Readlist({ title, author, image, link, ...props }: { title?: string; author?: string; image?: string; link?: string; props?: string }) {
    return(
        <Link href={link || "#"} className="w-full items-center flex flex-col p-2 pb-4 hover:shadow-md transition-shadow rounded-lg" {...props}>
            <div className="relative w-full aspect-[4/4]">
                <Image 
                    src={image || "/ReadlistDefault.png"}
                    alt={`Capa da Readlist ${title}`}
                    fill
                    className="object-cover rounded-lg"
                />
            </div>
            <div className="justify-center items-center text-center pt-2 w-full">
                <h4 className="text-h5 font-bold truncate">{title || "Título da Readlist"}</h4>
                <p className="text-b2 font-semibold truncate">{author || "@AutorDaReadlist"}</p>
            </div>
        </Link>
    )
}