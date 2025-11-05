"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Image from "next/image";

// Componentes
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Button from "@/components/button";
import LoadingPage from "@/components/loading";
import Post from "@/components/post";
import CommunityMember from "@/components/community-member";
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";

// Ícones
import AddIcon from "@/components/icons/AddIcon";
import RemoveIcon from "@/components/icons/RemoveIcon";
import Edit2Icon from "@/components/icons/Edit2Icon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import EditIcon from "@/components/icons/EditIcon";
import CommunityIcon from "@/components/icons/CommunityIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import PenToolIcon from "@/components/icons/PenToolIcon";
import ClosedBookIcon from "@/components/icons/ClosedBookIcon";

// Chamadas da API
import { getComunidadeByName, checkMemberOrMod, getMembers, getPosts, getModerators, enterCommunity, leaveCommunity } from "@/services/comunidade";

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CommunityPage(){
    const router = useRouter();
    const params = useParams();
    const { community } = params as { community: string };

    const [loading, setLoading] = useState(true);
    const [communityInfo, setCommunityInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [moderators, setModerators] = useState<any[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [isModerator, setIsModerator] = useState(false);

    // Tab Membros
    const [memberCount, setMemberCount] = useState(0);
    const [valueMembers, setValueMembers] = useState('members');

    // Tab Postagens
    const [valuePosts, setValuePosts] = useState('community-feed');

    useEffect(() => {
        if (!community) {
            router.replace("/not-found");
            return;
        }

        const fetchData = async () => {
            try {
                const communityTitle = slugToTitle(community);

                // Busca da comunidade
                const info = await getComunidadeByName(communityTitle);
                if (!info) {
                    console.log("Comunidade não encontrada:", communityTitle);
                    router.replace("/not-found");
                    return;
                }
                setCommunityInfo(info);

                // Verifica se usuário é membro ou moderador
                const { isMember, isModerator } = await checkMemberOrMod(info.nome);
                setIsMember(isMember);
                setIsModerator(isModerator);

                // Busca membros, moderadores e posts
                const [fetchedMembers, fetchedPosts, fetchedModerators] = await Promise.all([
                    getMembers(info.nome),
                    getPosts(info.nome),
                    getModerators(info.nome),
                ]);
                setMembers(fetchedMembers);
                setModerators(fetchedModerators);
                setPosts(fetchedPosts);

                // Seta contagem de membros
                setMemberCount(fetchedMembers.length);

            } catch (err) {

                console.error("Erro ao carregar comunidade:", err);
                router.replace("/not-found");

            } finally {

                setLoading(false);
            }
        };

        fetchData();
    }, [community, router]);

    const handleClick = async () => {
        try {
            if (isMember) {
                await leaveCommunity(communityInfo.nome);
                setIsMember(false);
            } else {
                await enterCommunity(communityInfo.nome);
                setIsMember(true);
            }

            const updatedMembers = await getMembers(communityInfo.nome);
            setMembers(updatedMembers);
            setMemberCount(updatedMembers.length);

        } catch (err) {
            console.error("Erro ao atualizar participação na comunidade:", err);
        }
    };

    const handleMembersTabChange = (newValue: string) => {
        setValueMembers(newValue);
    };

    const handlePostsTabChange = (newValue: string) => {
        setValuePosts(newValue);
    };

    if (loading) return <LoadingPage />;
    if (!communityInfo) return null;

    const communityTitle = slugToTitle(community);

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar placeholder="Buscar no Livra..." />

                {/*Parte Principal da Página da Comunidade*/}
                <main className="w-full pl-2 pr-4 py-2">

                    {/*Header da Comunidade*/}
                    <div className={`w-full flex flex-col ${communityInfo.imagem_url && 'h-[300px]'}`}>
                        {/*Banner*/}
                        <div className="w-full flex-grow overflow-hidden rounded-[12px]">
                            {/*SUBSTITUIR POR BANNER QUANDO TIVERMOS communityInfo.banner*/}
                            {communityInfo.imagem_url && <Image
                                src={communityInfo.imagem_url}
                                alt={`${communityInfo.nome} banner`}
                                className="w-full h-full object-cover"
                            />}
                        </div>
                        <div className="flex flex-row flex-shrink-0 items-center gap-3 mt-2 px-4">
                            {/*Foto da Comunidade */}
                            <div className={`w-[30%] aspect-square rounded-full overflow-hidden bg-[#32580B] ${communityInfo.imagem_url && 'medium-border-width boder-[#1F2A17]'}`}>
                                {communityInfo.imagem_url && <Image
                                    src={communityInfo.imagem_url}
                                    alt={`${communityInfo.nome} photo`}
                                    className="w-full h-full object-cover"
                                />}
                            </div>
                            {/*Info da Comunidade */}
                            <div className="flex flex-col text-[#1F2A17] gap-1">
                                <h1 className="text-h4">
                                    {communityTitle}
                                </h1>
                                <p className="text-b2 text-justify">
                                    {communityInfo.descricao}
                                </p>
                                {/*Botões*/}
                                <div className="flex flex-row gap-1">
                                    {!isMember && <Button
                                        text="Entrar"
                                        icon={<AddIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        onClick={handleClick}
                                    />}
                                    {isMember && <Button
                                        text="Sair"
                                        icon={<RemoveIcon />}
                                        colorScheme="light-brown"
                                        size="medium"
                                        onClick={handleClick}
                                    />}
                                    <Button
                                        text="Postar"
                                        icon={<Edit2Icon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        path={`/${community}/postar` /* PROVISÓRIO */}
                                    />
                                    <Button
                                        text="Wiki"
                                        icon={<OpenBookIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        path={`/wiki/${community}` /* PROVISÓRIO */}
                                    />
                                    {isModerator && 
                                    <Button
                                        text="Editar"
                                        icon={<EditIcon />}
                                        colorScheme="dark-brown"
                                        size="medium"
                                        path={`/${community}/editar-comunidade` /* PROVISÓRIO */}
                                    />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-row mt-4 flex-1 min-h-0">

                        {/*Tabs Lado Esquerdo - Postagens*/}
                        <div className="w-5/7 px-4 flex-1 overflow-auto">
                            <TabProvider value={valuePosts} onChange={handlePostsTabChange}>
                                <TabList>
                                    <Tab label="Postagens" icon={<Edit2Icon />} size="small" value="community-feed" />
                                    <Tab label="Fanarts" icon={<PenToolIcon />} size="small" value="fanart" />
                                    <Tab label="Fanfics" icon={<ClosedBookIcon />} size="small" value="fanfic" />
                                </TabList>
                                
                                {/*Postagens*/}
                                <TabPanel value="community-feed">
                                    {(() => {
                                        const filteredPosts = posts.filter((post) => post.categoria === "geral");

                                        posts.forEach(p => console.log(p));

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b3 light-neutral">
                                            Nenhum post ainda nesta categoria.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => (
                                            <Post
                                                key={post._id}
                                                id={post._id}
                                                community={post.comunidade.nome}
                                                author={post.autor.username}
                                                content={post.conteudo}
                                                commentsCount={post.comentarios.length}
                                                likesCount={post.curtidas}
                                            />
                                            ))}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                                
                                {/*Fanarts*/}
                                <TabPanel value="fanart">
                                    {(() => {
                                        const filteredPosts = posts.filter((post) => post.categoria === "fanart");

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b3 light-neutral">
                                            Nenhuma fanart ainda nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => (
                                            <Post
                                                key={post._id}
                                                id={post._id}
                                                community={post.comunidade.nome}
                                                author={post.autor.username}
                                                content={post.conteudo}
                                                commentsCount={post.comentarios.length}
                                                likesCount={post.curtidas}
                                            />
                                            ))}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                                
                                {/*Fanfics*/}
                                <TabPanel value="fanfic">
                                    {(() => {
                                        const filteredPosts = posts.filter((post) => post.categoria === "fanfic");

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b1 body-quotation light-neutral text-center">
                                            Nenhuma fanfic ainda nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => (
                                            <Post
                                                key={post._id}
                                                id={post._id}
                                                community={post.comunidade.nome}
                                                author={post.autor.username}
                                                content={post.conteudo}
                                                commentsCount={post.comentarios.length}
                                                likesCount={post.curtidas}
                                            />
                                            ))}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                            </TabProvider>
                        </div>

                        {/*Tabs Lado Direito - Membros*/}
                        <div className="w-2/7 px-4">
                            <div className="sticky top-2">
                                <TabProvider value={valueMembers} onChange={handleMembersTabChange}>
                                    <TabList>
                                        <Tab label={`Membros (${memberCount})`} icon={<CommunityIcon />} size="small" value="members" />
                                        <Tab label="Moderadores" icon={<CheckIcon />} size="small" value="mods" />
                                    </TabList>
                                    
                                    {/*Membros da Comunidade*/}
                                    <TabPanel value="members">
                                        {members.length === 0 ? (
                                            <p className="text-b1 body-quotation light-neutral text-center">
                                                Nenhum membro ainda nesta comunidade.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {members.map((member) => (
                                                    <CommunityMember
                                                        key={member._id}
                                                        username={member.username}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </TabPanel>
                                    
                                    {/*Moderadores da Comunidade*/}
                                    <TabPanel value="mods">
                                        {moderators.length === 0 ? (
                                            <p className="text-b1 body-quotation light-neutral text-center">
                                                Nenhum moderador ainda nesta comunidade.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {moderators.map((moderador) => (
                                                    <CommunityMember
                                                        key={moderador._id}
                                                        username={moderador.username}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </TabPanel>
                                </TabProvider>
                            </div>
                        </div>
                    </div>

                </main>

            </div>

        </div>
    );
}