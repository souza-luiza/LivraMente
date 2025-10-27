import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import { notFound } from "next/navigation";
import Button from "@/components/button";
import Image from "next/image";
import KemiImg from '../../../../public/team/Kemi.jpg'

import AddIcon from "@/components/icons/AddIcon";
import Edit2Icon from "@/components/icons/Edit2Icon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import EditIcon from "@/components/icons/EditIcon";
import CommunityIcon from "@/components/icons/CommunityIcon";
import ProfilePosts from "@/components/profile-posts";

interface CommunityPageProps {
    params: Promise<{community: string}>;
    isMod: boolean; // Usuário é moderador da comunidade
}

const communityInfo = {
    name: "Community",
    description: "This is the community's description.",
    banner: KemiImg,
    img: KemiImg,
    numMembers: 234
}

export default async function CommunityPage({ params, isMod = false }: CommunityPageProps){
    const { community } = await params;

    // Implementar a lógica para confirmar se comunidade existe no banco de dados
    // Se não existir, chamar notFound()
    if (!community || community.trim() === '') {
        notFound();
    }

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar placeholder="Buscar na comunidade..." />

                {/*Parte Principal da Página da Comunidade*/}
                <main className=" w-full h-full pl-2 pr-4 pt-2 pb-2">

                    {/*Header da Comunidade*/}
                    <div className="w-full h-1/8 flex flex-col">
                        {/*Banner*/}
                        <div className="w-full flex-grow overflow-hidden rounded-[12px] bg-[#E5EEDF]">
                            <Image
                                src={communityInfo.banner}
                                alt={`${communityInfo.name} banner`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/*Info da Comunidade */}
                        <div className="w-full flex flex-col flex-shrink-0 text-[#1F2A17] gap-1 m-1">
                            <h1 className="text-h4">
                                {community}
                            </h1>
                            <p className="text-b2">
                                {communityInfo.description}
                            </p>
                            <div className="flex flex-row gap-1">
                                <Button
                                    text="Entrar"
                                    icon={<AddIcon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                />
                                <Button
                                    text="Postar"
                                    icon={<Edit2Icon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                />
                                <Button
                                    text="Wiki"
                                    icon={<OpenBookIcon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                />
                                {isMod && 
                                <Button
                                    text="Editar"
                                    icon={<EditIcon />}
                                    colorScheme="dark-brown"
                                    size="medium"
                                />}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full flex flex-row mt-2 gap-4">

                        {/*Postagens*/}
                        <div className="w-5/7 h-full flex flex-col px-4">
                            <div className="flex flex-row gap-2 mb-2 text-h6 heading-underline text-[#23160A]">
                                <h2>Postagens</h2>
                                <h2>Artes</h2>
                            </div>
                            <ProfilePosts username="user" />
                        </div>

                        {/*Membors da Comunidade*/}
                        <div className="w-2/7 h-full flex flex-col px-4">
                            <div className="flex flex-row justify-between text-h6 text-[#23160A]">
                                <h2 className="heading-underline">Membros</h2>
                                <div className="flex flex-row gap-1">
                                    {communityInfo.numMembers}
                                    <CommunityIcon className="icon-medium" />
                                </div>
                            </div>
                        </div>
                        
                    </div>

                </main>

            </div>

        </div>
    );
}