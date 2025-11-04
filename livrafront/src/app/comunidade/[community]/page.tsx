import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import { notFound } from "next/navigation";
import Image from "next/image";
import KemiImg from '../../../../public/team/Kemi.jpg'
import CommunityPosts from "./community-page-posts";
import CommunityPageButtons from "./community-page-buttons";
import CommunityMembers from "./community-page-members";

// API
import { getComunidadeByName, checkMemberOrMod, getMembers, getPosts } from "@/services/comunidade";

interface CommunityPageProps {
    params: {communitySlug: string};
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CommunityPage({ params }: CommunityPageProps){
    const { communitySlug } = await params;

    if (!communitySlug) {
        notFound();
    }

    // Converte slug em título que será pesquisado no banco
    const communityTitle = slugToTitle(communitySlug);

    // Busca da comunidade pelo nome
    const community = await getComunidadeByName(communityTitle).catch(() => null);
    if (!community) notFound();

    // REVER ESSES CONST AQUI!
    const { isMember, isModerator } = await checkMemberOrMod(community.nome).catch(() => ({ isMember: false, isModerator: false }));
    const members = await getMembers(community.nome).catch(() => null);
    const posts = await getPosts(community.nome).catch(() => null);

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
                    <div className="w-full h-[10%] flex flex-col">
                        {/*Banner*/}
                        <div className="w-full flex-grow overflow-hidden rounded-[12px] bg-[#E5EEDF]">
                            {/*community.banner && <Image
                                src={community.banner}
                                alt={`${community.nome} banner`}
                                className="w-full h-full object-cover"
                            />*/}
                        </div>
                        <div className="flex flex-row flex-shrink-0 items-center gap-3 mt-2 px-4">
                            {/*Foto da Comunidade */}
                            <div className="max-h-[100px] aspect-square rounded-full medium-border-width overflow-hidden">
                                {community.imagem_url && <Image
                                    src={community.imagem_url}
                                    alt={`${community.nome} photo`}
                                    className="w-full h-full object-cover"
                                />}
                            </div>
                            {/*Info da Comunidade */}
                            <div className="flex flex-col text-[#1F2A17] gap-1">
                                <h1 className="text-h4">
                                    {communityTitle}
                                </h1>
                                <p className="text-b2">
                                    {community.descricao}
                                </p>
                                <CommunityPageButtons community={community} isMember={isMember} isModerator={isModerator} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full flex flex-row mt-4">

                        {/*Postagens*/}
                        <div className="w-5/7 px-4">
                            <CommunityPosts posts={posts} />
                        </div>

                        {/*Membors da Comunidade*/}
                        <div className="w-2/7 px-4">
                            <CommunityMembers members={members} isMember={isMember} isModerator={isModerator} />
                        </div>
                    </div>

                </main>

            </div>

        </div>
    );
}