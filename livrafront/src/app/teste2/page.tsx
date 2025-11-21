'use client'
import Button from "@/components/button";
import Edit2Icon from "@/components/icons/Edit2Icon";
import HeartIcon from "@/components/icons/HeartIcon";
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import { useState } from "react";

export default function ReadlistPage() {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex flex-col gap-2">
                <SearchBar placeholder="Busque no livra..." />
                <div className="w-full flex flex-row">
                    <div className="pt-6 pr-6 pl-6 flex items-start gap-3">
                        <Image
                            src={'/Readlist.svg'} 
                            alt={"Imagem da Readlist"} 
                            width={200}
                            height={200}
                            className="object-cover rounded-lg"
                        />
                        <div className="flex flex-col gap-3">
                            <h3 className="text-h3">Nome da Readlist</h3>
                            <div className="bg-[#E5EEDF] small-border-radius text-center">
                                <h5 className="text-h5">@username</h5>
                                <p className="text-b1">Criador</p>
                            </div>
                            <div className="bg-[#E5EEDF] small-border-radius text-center">
                                <h5 className="text-h5">30</h5>
                                <p className="text-b1">Livros</p>
                            </div>
                        </div>
                        <Button icon={<HeartIcon fill={isFavorite ? "currentColor" : "none"}/>} size="large" colorScheme="light-brown" onClick={handleFavorite} />
                    </div>
                    <div className="flex items-end">
                        <Button icon={<Edit2Icon/>} text='Editar' />
                    </div>
                </div>
                <div className="pr-6 pl-6">
                    <p className="text-b2">Na abertura dos Jogos Vorazes, a organização não recolhe os corpos dos combatentes caídos e dá tiros de canhão até o final. Cada tiro, um morto. Onze tiros no primeiro dia. Treze jovens restaram, entre eles, Katniss. Para quem os tiros de canhão serão no dia seguinte?... Após o fim da América do Norte, uma nova nação chamada Panem surge. Formada por doze distritos, é comandada com mão de ferro pela Capital. Uma das formas com que demonstra seu poder sobre o resto do carente país é com Jogos Vorazes, uma competição anual transmitida ao vivo pela televisão, em que um garoto e uma garota de doze a dezoito anos de cada distrito são selecionados e obrigados a lutar até a morte! Para evitar que sua irmã seja a mais nova vítima do programa, Katniss se oferece para participar em seu lugar. Vinda do empobrecido Distrito 12, ela sabe como sobreviver em um ambiente hostil. Peeta, um garoto que ajudou sua família no passado, também foi selecionado. Caso vença, terá fama e fortuna. Se perder, morre. Mas para ganhar a competição, será preciso muito mais do que habilidade.</p>
                </div>
            </main>
        </div>
    )
}