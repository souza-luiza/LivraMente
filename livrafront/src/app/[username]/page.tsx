"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOwnReadlists, getPublicReadlists } from "@/services/readlists";
import type { Readlist } from "@/types/readlist";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import ProfileIcon from "@/components/profile-icon";
import EditIcon from "@/components/icons/EditIcon";
import ProfileReadlists from "@/components/profile-readlists";
import ProfilePosts from "@/components/profile-posts";
import ProfileBadge from "@/components/profile-badge";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import LogoIcon from "@/components/icons/LogoIcon";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import ErrorIcon from "@/components/icons/ErrorIcon";
import { Gamificacao, UserProfile } from "@/types/users";
import { getSessionInfos } from "@/services/auth";
import { toast } from "react-toastify";
import ToastNotification from '@/components/toast-notification';
import { getProfile } from "@/services/userService";

export default function UserProfilePage(){
    const router = useRouter();
    const params = useParams();
    const { username } = params as { username: string };

    const [isLoading, setIsLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [readlists, setReadlists] = useState<Readlist[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!username || username.trim() === '') 
          notFound();
    
        const fetchData = async () => {
            try {
                const info = await getSessionInfos();
                if(!info) {
                    router.replace('/entrar');
                    return;
                }
                const own = info.username === username;
                setIsOwnProfile(own);

                // Carrega perfil + readlists:
                const data = await getProfile(username);
                setUserData(data);
                console.log(data);
                const userReadlists = own ? await getOwnReadlists() : await getPublicReadlists(username);
                setReadlists(userReadlists);
            } catch (error) {
                toast.error("Erro ao carregar dados do usuário.");
                setError(error instanceof Error ? error.message : 'Erro ao carregar perfil do usuário');
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [username, router]);

    const calculateXPPercentage = (gamification?: Gamificacao) => {
        if (!gamification) return 0;
        return Math.round((gamification.XP / gamification.XP_proximo_nivel) * 100);
    };

    const handleGoBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]" />
                        <div className="w-24 h-24 text-[#1F2A17]">
                            <LogoIcon />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <main className="flex flex-col justify-center items-center w-full p-12 text-black">
                    <ErrorIcon size={120} fill="#1F2A17" className="mb-4" aria-label="Erro" role="img" />
                    <h1 className="text-4xl font-bold mb-4">Perfil Indisponível</h1>
                    <p className="text-b2 mb-4 text-center max-w-md">
                        {'Não foi possível carregar este perfil. O usuário pode não existir ou ocorreu um erro.'}
                    </p>
                    <div className="flex flex-col gap-4 items-center">
                        <Button 
                            onClick={handleGoBack}
                            text="Voltar"
                            colorScheme="dark-green"
                            size="medium"
                            icon={<ArrowLeftIcon aria-label="Ícone de seta" role="img" />}
                        />
                        <Link href="/" className="text-[#5C8046] hover:underline">
                            Ir para página inicial
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const xpPercentage = calculateXPPercentage(userData.gamificacao);
    const userLevel = userData.gamificacao?.nivel || 1;

    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center p-4">
                {/* ProfileIcon com foto integrada */}
                <div className="w-48 h-48 mb-4 relative">
                    <ProfileIcon 
                        size={190} 
                        percentage={xpPercentage} 
                        avatarUrl={userData.avatarUrl}
                        username={userData.username}
                        className="text-[var(--success-700)]" 
                    />
                    <div className="absolute top-0 right-0 -translate-y-0 translate-x-12">
                        <ProfileBadge content={userLevel} width={60} height={30} />
                    </div>
                </div>
                
                <h4 className="text-3xl font-bold pb-2 text-h5">@{userData.username}</h4>
                <p className="pb-4 text-b1 body-quotation">{userData.pronouns || ""}</p>
                
                {isOwnProfile && (
                    <Button text="Editar Perfil" colorScheme="dark-brown" size="medium" icon={<EditIcon />} path={`/${username}/editar-perfil`} />
                )}
                
                <div className="w-full flex justify-center items-stretch mt-8 gap-4">
                    <div className="w-1/2 bg-white rounded-lg p-4 my-4 flex flex-col">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/readlists`}>
                            Readlists<ChevronRightIcon width={24} height={24}/>
                        </Link>
                        <div className="flex-1 overflow-y-auto">
                            <ProfileReadlists readlists={readlists} username={username} />
                        </div>
                    </div>
                    <div className="w-1/2 bg-white rounded-lg p-4 my-4 flex flex-col">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/posts`}>
                            Postagens<ChevronRightIcon width={24} height={24}/>
                        </Link>
                        <div className="flex-1 overflow-y-auto">
                            <ProfilePosts username={username} />
                        </div>
                    </div>
                </div>
            </main>
            <ToastNotification/>
        </div>
    );
}