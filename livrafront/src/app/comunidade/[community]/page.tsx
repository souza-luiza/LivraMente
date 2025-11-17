"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Componentes
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Button from "@/components/button";
import LoadingPage from "@/components/loading";
import LoadingComponent from "@/components/portable-loading";
import PostComponent from "@/components/post";
import CommunityMember from "@/components/community-member";
import CreatePostModal from "@/components/CreatePostModal";
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";
import CompactCommunityHeader from "@/components/compact-community-header";

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
import CompassIcon from "@/components/icons/CompassIcon";
import TrashIcon from "@/components/icons/TrashIcon";

// Chamadas da API
import { communityService } from "@/services/comunidade";
import { postsService } from "@/services/posts";

// Types
import { User } from "@/types/auth";
import { Post } from "@/types/post";
import { Comunidade } from "@/types/comunidade";
import { PostCategoria } from "@/types/post";
import PopUp from "@/components/pop-up";

// Funções
import { slugToTitle, titleToSlug } from '@/lib/slugify';

export default function CommunityPage(){
    const router = useRouter();
    const params = useParams();
    const { community } = params as { community: string };

    // Loading
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingModerators, setLoadingModerators] = useState(true);

    // Dados da Comunidade
    const [communityInfo, setCommunityInfo] = useState<Comunidade>();
    const [members, setMembers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [moderators, setModerators] = useState<User[]>([]);

    // Status do Usuário
    const [isMember, setIsMember] = useState(false);
    const [isModerator, setIsModerator] = useState(false);

    // Criar Post
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // Tabs
    const [valueMembers, setValueMembers] = useState('members');
    const [valuePosts, setValuePosts] = useState('community-feed');

    // Header Compacto
    const [showCompactHeader, setShowCompactHeader] = useState(false);

    // Pop Ups
    const [showWelcomePopUp, setShowWelcomePopUp] = useState(false);
    const [showLeavingPopUp, setShowLeavingPopUp] = useState(false);

    useEffect(() => {
        if (!community) {
            router.replace("/not-found");
            return;
        }

        const fetchData = async () => {
            try {
                // Busca da comunidade
                const info = await communityService.getComunidadeByName(slugToTitle(community));
                if (!info) {
                    router.replace("/not-found");
                    return;
                }
                setCommunityInfo(info);

                // Verifica se usuário é membro ou moderador
                const { isMember, isModerator } = await communityService.checkMemberOrMod(info.nome);
                setIsMember(isMember);
                setIsModerator(isModerator);

                // Busca membros, moderadores e posts
                const [fetchedMembers, fetchedPosts, fetchedModerators] = await Promise.all([
                    communityService.getMembers(info.nome),
                    communityService.getPosts(info.nome),
                    communityService.getModerators(info.nome),
                ]);
                setMembers(fetchedMembers);
                setModerators(fetchedModerators);
                setPosts(fetchedPosts);

            } catch (err) {

                console.error("Erro ao carregar comunidade:", err);
                router.replace("/not-found");

            } finally {
                setLoading(false);
                setLoadingPosts(false);
                setLoadingMembers(false);
                setLoadingModerators(false);
            }
        };

        fetchData();
    }, [community, router]);

    useEffect(() => {
        const handleScroll = () => {
            const mainHeader = document.querySelector('.community-header');
            if (!mainHeader) return;
            const rect = mainHeader.getBoundingClientRect();
            setShowCompactHeader(rect.bottom <= 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCommunityStatus = async () => {
        if (!communityInfo) return;

        try {
            if (isMember) {
                // Sair da comunidade
                await communityService.leaveCommunity(communityInfo.nome);
                setIsMember(false);
                setIsModerator(false);
                setShowLeavingPopUp(false);
                
            } else {
                // Entrar na comunidade
                await communityService.enterCommunity(communityInfo.nome);
                setIsMember(true);
                setShowWelcomePopUp(true);
            }

            // Atualiza lista de membros
            const updatedMembers = await communityService.getMembers(communityInfo.nome);
            setMembers(updatedMembers);

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

    const handleOpenPostModal = () => {
        setIsPostModalOpen(true);
    }

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
    }

    const handlePostSuccess = async () => {
        if (!communityInfo) return;

        // Atualiza lista de posts
        handleRefreshPosts();

        console.log('Post criado com sucesso!');
    }

    const handleRemoveMember = async (targetUserId: string) => {
        if (!communityInfo || !isMember || !isModerator || !targetUserId) return;

        setLoadingMembers(true);

        try {
            // Remove membro da comunidade
            await communityService.removeMember(communityInfo.nome, targetUserId);

            // Atualiza lista de membros e contagem
            const updatedMembers = await communityService.getMembers(communityInfo.nome);
            setMembers(updatedMembers);

        } catch (err) {
            console.error("Erro ao remover membro da comunidade:", err);

        } finally {
            setLoadingMembers(false);
        }
    }

    const handleMakeModerator = async (targetUserId: string) => {
        if (!communityInfo || !isMember || !isModerator || !targetUserId) return;

        setLoadingModerators(true);

        try {
            // Promove membro a moderador
            await communityService.makeMemberModerator(communityInfo.nome, targetUserId);

            // Atualiza lista de moderadores
            const updatedModerators = await communityService.getModerators(communityInfo.nome);
            setModerators(updatedModerators);

        } catch (err) {
            console.error("Erro ao tornar membro moderador da comunidade:", err);

        } finally {
            setLoadingModerators(false);
        }
    }

    const handleReviewPost = async (postId: string, aprovar: boolean, categoria: PostCategoria) => {
        if (!communityInfo || !postId) return;

        try {
            // Aprova ou rejeita solicitação de revisão
            await postsService.moderatePost(postId, aprovar, categoria);

            // Atualiza lista de posts
            handleRefreshPosts();

        } catch (err) {
            console.error("Erro ao revisar o post:", err);
        }
    }

    const handleRefreshPosts = async () => {
        if (!communityInfo) return;

        setLoadingPosts(true);
        console.log("Atualizando posts...");

        try{
            // Atualiza lista de posts
            const updatedPosts = await communityService.getPosts(communityInfo.nome);
            setPosts(updatedPosts);
            
        } catch(err) {
            console.log("Erro ao atualizar posts:", err);
        } finally {
            setLoadingPosts(false);
        }
    }

    const handleRedirectToPost = (post: Post) => {
        router.push(`/comunidade/${titleToSlug(post.comunidade.nome)}/postagem/${post._id}`);
    }

    if (loading) return <LoadingPage />;
    if (!communityInfo) return null;

    const communityTitle = slugToTitle(community);

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar />

                {/*Parte Principal da Página da Comunidade*/}
                <main className="w-full pl-2 pr-4 py-2">

                    {/*Header da Comunidade*/}
                    <div className={`w-full flex flex-col community-header ${communityInfo.imagem_url && 'h-[300px]'}`}>
                        {/*Banner*/}
                        <div className="w-full flex-grow overflow-hidden rounded-[12px]">
                            {/*SUBSTITUIR POR BANNER QUANDO TIVERMOS communityInfo.banner*/}
                            {communityInfo.imagem_url && <Image
                                src={communityInfo.imagem_url}
                                alt={`${communityInfo.nome} banner`}
                                className="w-full h-full object-cover"
                            />}
                        </div>
                        <div className="flex flex-row flex-shrink-0 items-start gap-3 mt-2 px-4">
                            {/*Foto da Comunidade */}
                            <div className={`flex-shrink-0 w-24 h-24 rounded-full overflow-hidden bg-[#472B15] ${communityInfo.imagem_url && 'medium-border-width boder-[#1F2A17]'}`}>
                                {communityInfo.imagem_url && <Image
                                    src={communityInfo.imagem_url}
                                    alt={`${communityInfo.nome} photo`}
                                    className="object-cover"
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
                                <div className="flex flex-row mt-1 gap-1">
                                    {!isMember && <Button
                                        text="Entrar"
                                        icon={<AddIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        onClick={handleCommunityStatus}
                                    />}
                                    {isMember && <Button
                                        text="Sair"
                                        icon={<RemoveIcon />}
                                        colorScheme="light-brown"
                                        size="medium"
                                        onClick={() => setShowLeavingPopUp(true)}
                                    />}
                                    {isMember && <Button
                                        text="Postar"
                                        icon={<Edit2Icon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        onClick={handleOpenPostModal}
                                    />}
                                    <Button
                                        text="Criar História"
                                        icon={<PenToolIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        path="/criar-historia"
                                    />
                                    {isModerator && <Button
                                        text="Editar"
                                        icon={<EditIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        path={`/comunidade/${community}/editar`}
                                    />}
                                    <Button
                                        text="Wiki"
                                        icon={<OpenBookIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        path={`/wiki/${communityInfo.nome}` /* PROVISÓRIO */}
                                    />
                                    {/* Modal de Criação de Post */}
                                    <CreatePostModal
                                        isOpen={isPostModalOpen}
                                        onClose={handleClosePostModal}
                                        communityName={communityInfo.nome}
                                        onSuccess={handlePostSuccess}
                                    />
                                    <PopUp
                                        title={`${communityInfo.nome}`}
                                        description="Seja bem-vindo à nossa comunidade!"
                                        leftIcon={<CommunityIcon size={24} />}
                                        isOpen={showWelcomePopUp}
                                        button1={{ text: "Explorar", icon: <CompassIcon />, colorScheme: "dark-green", onClick: () => setShowWelcomePopUp(false) }}
                                        onClose={() => setShowWelcomePopUp(false)}
                                    />
                                    <PopUp
                                        title="De partida?"
                                        description="Você está saindo da comunidade."
                                        isOpen={showLeavingPopUp}
                                        button1={{ text: "Cancelar", icon: <TrashIcon />, colorScheme: "light-green", onClick: () => setShowLeavingPopUp(false) }}
                                        button2={{ text: "Sair", icon: <RemoveIcon />, colorScheme: "light-brown", onClick: handleCommunityStatus}}
                                        onClose={() => setShowLeavingPopUp(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-row mt-4 flex-1 min-h-0">

                        {/*Tabs Lado Esquerdo - Postagens*/}
                        <div className="w-5/7 px-4 flex-1 overflow-auto">
                            
                            {showCompactHeader && <CompactCommunityHeader
                                community={communityInfo}
                                isMember={isMember}
                                isModerator={isModerator}
                                onToggleMembership={handleCommunityStatus}
                                onOpenPostModal={handleOpenPostModal}
                            />}

                            <TabProvider value={valuePosts} onChange={handlePostsTabChange}>
                                <TabList>
                                    <Tab label="Postagens" icon={<Edit2Icon />} size="small" value="community-feed" />
                                    <Tab label="Fanarts" icon={<PenToolIcon />} size="small" value="fanart" />
                                    <Tab label="Fanfics" icon={<ClosedBookIcon />} size="small" value="fanfic" />
                                    {isModerator && <Tab label="Solicitações de Revisão" icon={<CheckIcon />} size="small" value="revision" />}
                                </TabList>
                                
                                {/*Postagens*/}
                                <TabPanel value="community-feed">
                                    {(() => {
                                        if (loadingPosts) return (<LoadingComponent size="small" className="p-8" />);
                                        
                                        const filteredPosts = posts.filter((post) => post.categoria === "geral" && post.solicitacao_revisao !== true);

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                            Nenhum post ainda nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => {
                                                return (
                                                    <PostComponent 
                                                        key={post._id}
                                                        post={post}
                                                        isModerator={isModerator}
                                                        handleComment={() => handleRedirectToPost(post)}
                                                        onDelete={handleRefreshPosts}
                                                        onUpdate={handleRefreshPosts} 
                                                    />
                                                );
                                            })}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                                
                                {/*Fanarts*/}
                                <TabPanel value="fanart">
                                    {(() => {
                                        if (loadingPosts) return (<LoadingComponent size="small" className="p-8" />);
                                        
                                        const filteredPosts = posts.filter((post) => post.categoria === "fanart" && post.solicitacao_revisao !== true);

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                            Nenhuma fanart ainda nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => {
                                                return (
                                                    <PostComponent 
                                                        key={post._id}
                                                        post={post}
                                                        isModerator={isModerator}
                                                        handleComment={() => handleRedirectToPost(post)}
                                                        onDelete={handleRefreshPosts}
                                                        onUpdate={handleRefreshPosts} 
                                                    />
                                                );
                                            })}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                                
                                {/*Fanfics*/}
                                <TabPanel value="fanfic">
                                    {(() => {
                                        if (loadingPosts) return (<LoadingComponent size="small" className="p-8" />);

                                        const filteredPosts = posts.filter((post) => post.categoria === "fanfic" && post.solicitacao_revisao !== true);

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                            Nenhuma fanfic ainda nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => {
                                                return (
                                                    <PostComponent 
                                                        key={post._id}
                                                        post={post}
                                                        isModerator={isModerator}
                                                        handleComment={() => handleRedirectToPost(post)}
                                                        onDelete={handleRefreshPosts}
                                                        onUpdate={handleRefreshPosts} 
                                                    />
                                                );
                                            })}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>

                                {/*Solicitação de Revisão*/}
                                <TabPanel value="revision">
                                    {(() => {
                                        if (loadingPosts) return (<LoadingComponent size="small" className="p-8" />);

                                        const filteredPosts = posts.filter((post) => post.solicitacao_revisao === true);

                                        return filteredPosts.length === 0 ? (
                                        <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                            Nenhuma solicitação de revisão nesta comunidade.
                                        </p>
                                        ) : (
                                        <div className="flex flex-col gap-4">
                                            {filteredPosts.map((post) => {
                                                return (
                                                    <div key={post._id} className="flex flex-col gap-1">
                                                        <PostComponent 
                                                            post={post}
                                                            handleComment={() => handleRedirectToPost(post)}
                                                            isModerator={isModerator}
                                                            disableActions={true}
                                                        />
                                                        <div className="flex flex-row gap-1 justify-end">
                                                            <Button
                                                                text="Aprovar como Fanart"
                                                                icon={<CheckIcon />}
                                                                size="small"
                                                                variant="aprovar"
                                                                onClick={() => handleReviewPost(post._id, true, PostCategoria.FANART)}
                                                            />
                                                            <Button
                                                                text="Aprovar como Fanfic"
                                                                icon={<CheckIcon />}
                                                                size="small"
                                                                variant="aprovar"
                                                                onClick={() => handleReviewPost(post._id, true, PostCategoria.FANFIC)}
                                                            />
                                                            <Button
                                                                text="Rejeitar"
                                                                icon={<RemoveIcon />}
                                                                size="small"
                                                                variant="rejeitar"
                                                                onClick={() => handleReviewPost(post._id, false, PostCategoria.GERAL)}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        );
                                    })()}
                                </TabPanel>
                            </TabProvider>
                        </div>

                        {/*Tabs Lado Direito - Membros*/}
                        <div className="w-2/7 px-4">
                            <div className="sticky top-16">
                                <TabProvider value={valueMembers} onChange={handleMembersTabChange}>
                                    <TabList>
                                        <Tab label="Membros" icon={<CommunityIcon />} size="small" value="members" />
                                        <Tab label="Moderadores" icon={<CheckIcon />} size="small" value="mods" />
                                    </TabList>
                                    
                                    {/*Membros da Comunidade*/}
                                    <TabPanel value="members">
                                        {(() => {
                                            if (loadingMembers) return (<LoadingComponent size="small" className="p-8" />);
                                        
                                            return members.length === 0 ? (
                                                <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                                    Nenhum membro ainda nesta comunidade.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {members.map((member) => (
                                                        <CommunityMember
                                                            key={member._id}
                                                            userId={member._id}
                                                            username={member.username}
                                                            isCurrentUserModerator={isModerator}
                                                            isTargetUserModerator={moderators.some(mod => mod._id === member._id)}
                                                            handleRemoveMember={handleRemoveMember}
                                                            handleMakeModerator={handleMakeModerator}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </TabPanel>
                                    
                                    {/*Moderadores da Comunidade*/}
                                    <TabPanel value="mods">
                                        {(() => {
                                            if (loadingModerators) return (<LoadingComponent size="small" className="p-8" />);

                                            return moderators.length === 0 ? (
                                                <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                                    Nenhum moderador ainda nesta comunidade.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {moderators.map((moderador) => (
                                                        <CommunityMember
                                                            key={moderador._id}
                                                            userId={moderador._id}
                                                            username={moderador.username}
                                                            isTargetUserModerator={true}
                                                            isCurrentUserModerator={isModerator}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })()}
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