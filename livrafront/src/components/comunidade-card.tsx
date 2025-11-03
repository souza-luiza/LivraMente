import Image from "next/image";
import Link from "next/link";

export default function Comunidade({ id, name, descricao, image}: {id?:string; name?:string; descricao?:string; image?:string }) {
    return (
        <Link href={`/comunidades/${id}`} className="w-full flex items-center p-4 gap-2 hover:shadow-md transition-shadow medium-border-radius">
            {/*Coluna da Imagem*/}
            <div className="w-1/5 overflow-hidden rounded-full border-[3px] text-[var(--primary-700)] bg-[#3D552F]" style={{width: 80, height: 80}}>
                {image ? (<Image
                    src={image}
                    alt={"Imagem da Comunidade"}
                    width={80}
                    height={80}
                    className="object-cover"
                />) : null}
            </div>

            {/*Coluna do conteúdo*/}
            <div className="flex flex-col w-4/5 pl-2">
                <h6 className="text-h6 font-semibold">{name || "Nome da comunidade"}</h6>
                <p className="text-b3 line-clamp-2">{descricao || "Descrição da comunidade"}</p>  
            </div>
        </Link>
    )
}