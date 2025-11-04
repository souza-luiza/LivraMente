import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import { notFound } from "next/navigation";
import Image from "next/image";
import KemiImg from '../../../../public/team/Kemi.jpg'
import CommunityPosts from "./community-page-posts";
import CommunityPageButtons from "./community-page-buttons";
import CommunityMembers from "./community-page-members";
import CommunityIcon from "@/components/icons/CommunityIcon";


interface CommunityPageProps {
    params: Promise<{community: string}>;
    isMember: boolean; // Usuário é membro da comunidade
    isMod: boolean; // Usuário é moderador da comunidade
}

const communityInfo = {
    name: "Community",
    description: "This is the community's description.",
    banner: KemiImg,
    img: KemiImg,
    numMembers: 234
}

export default async function CommunityPage({ params, isMember = true, isMod = false }: CommunityPageProps){
    const { community } = await params;

    // Implementar a lógica para confirmar se comunidade existe no banco de dados
    // Se não existir, chamar notFound()
    if (!community || community.trim() === '') {
        notFound();
    }

    const handleClick = () => {
        // Lógica para entrar/sair da comunidade
    }

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar placeholder="Buscar no Livra..." />

                {/*Parte Principal da Página da Comunidade*/}
                <main className=" w-full h-full pl-2 pr-4 py-2">

                    {/*Header da Comunidade*/}
                    <div className="w-full h-1/10 flex flex-col">
                        {/*Banner*/}
                        <div className="w-full flex-grow overflow-hidden rounded-[12px] bg-[#E5EEDF]">
                            <Image
                                src={communityInfo.banner}
                                alt={`${communityInfo.name} banner`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-row flex-shrink-0 items-center gap-3 mt-2 px-4">
                            {/*Foto da Comunidade */}
                            <div className="max-h-[100px] aspect-square rounded-full medium-border-width overflow-hidden">
                                <Image
                                    src={communityInfo.img}
                                    alt={`${communityInfo.name} photo`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/*Info da Comunidade */}
                            <div className="flex flex-col text-[#1F2A17] gap-1">
                                <h1 className="text-h4">
                                    {community}
                                </h1>
                                <p className="text-b2">
                                    {communityInfo.description}
                                </p>
                                <CommunityPageButtons community={community} isMember={isMember} isMod={isMod} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full flex flex-row mt-4">

                        {/*Postagens*/}
                        <div className="w-5/7 px-4">
                            <CommunityPosts />
                        </div>

                        {/*Membros da Comunidade*/}
                        <div className="w-2/7 px-4">
                            <CommunityMembers isMember={isMember} isMod={isMod} />
                        </div>
                    </div>

                </main>

            </div>

        </div>
    );
}