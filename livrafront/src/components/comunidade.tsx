import Image from "next/image";
import Link from "next/link";

export default function Comunidade({ id, name, descricao, image}: {id?:string; name?:string; descricao?:string; image?:string }) {
    return (
        <Link href={`/comunidades/${id}`} className="w-full items-center flex items-center p-4 gap-2 hover:shadow-md transition-shadow rounded-lg">
                    {/*Coluna da Imagem*/}
                    <div className="flex-shrink-0">
                        <Image
                            src={image || "/Readlist.svg"}
                            alt={`Imagem da comunidade ${name}`}
                            width={80}
                            height={80}
                            className="object-cover rounded-lg"
                        />
                    </div>

                    {/*Coluna do conteúdo*/}
                    <div className="flex flex-col">
                        <h6 className="text-h6 font-semibold">{name || "Nome da comunidade"}</h6>
                        <p className="text-b3 line-clamp-2">{descricao || "Descrição da comunidade"}</p>  
                    </div>
        </Link>
    )
}