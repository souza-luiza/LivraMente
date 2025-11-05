import Image from "next/image";
import Link from "next/link";

interface ComunidadeCardProps {
    id: string;
    nome: string;
    descricao?: string;
    image?: string;
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase() // transforma tudo em minúsculo
    .normalize('NFD') // separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos
    .replace(/[^a-z0-9]+/g, '-') // substitui tudo que não é letra ou número por hífen
    .replace(/^-+|-+$/g, ''); // remove hífens do início e do fim
}

export default function Comunidade({ id, nome, descricao, image }: ComunidadeCardProps) {
    return (
        <Link href={`/comunidade/${titleToSlug(nome)}`} className="w-full flex items-center p-4 gap-2 hover:shadow-md transition-shadow medium-border-radius">
            {/*Coluna da Imagem*/}
            <div className="w-1/5 aspect-square relative overflow-hidden rounded-full border-[3px] text-[var(--primary-700)] bg-[#3D552F]">
                {image ? (<Image
                    src={image}
                    alt={"Imagem da Comunidade"}
                    fill
                    className="object-cover"
                />) : null}
            </div>

            {/*Coluna do conteúdo*/}
            <div className="flex flex-col w-4/5 pl-2">
                <h6 className="text-h6 font-semibold">{nome || "Nome da comunidade"}</h6>
                <p className="text-b3 line-clamp-2">{descricao || "Descrição da comunidade"}</p>  
            </div>
        </Link>
    )
}