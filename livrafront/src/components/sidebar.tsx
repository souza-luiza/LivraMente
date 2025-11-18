"use client";
import { useEffect, useState } from "react";
import Button from "./button";
import Image from "next/image";

import LogoIcon from "./icons/LogoIcon";
import HomeIcon from "./icons/HomeIcon";
import ProfileIcon from "./icons/ProfileIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import SettingsIcon from "./icons/SettingsIcon";
import LogoutIcon from "./icons/LogoutIcon";
import { getSessionInfos, logoutUser } from "@/services/auth";
import { toast } from "react-toastify";
import ToastNotification from '@/components/toast-notification';
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";

export default function Sidebar() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const info = await getSessionInfos();
                setUserInfo(info);
            } catch (error) {}
        }
        fetchUserInfo();
    }, [userInfo]);

    const handleClick = async () => {
        try {
            await logoutUser();
            router.push('/entrar');
        } catch(error) {
            if(error instanceof Error && error.message === "Failed to fetch") 
                toast.error("Não foi possível conectar ao servidor.");
            else
                toast.error(error instanceof Error ? error.message : "Erro ao deslogar.");
        }
    }

    return (
        <nav data-testid="sidebar" className="light-green h-[calc(100vh-1rem)] sticky top-2 flex flex-col w-fit pt-4 pb-4 m-2 large-border-radius z-50">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-[8px]">   
                    <Button icon={<LogoIcon />} colorScheme="light-green" size="large" path="/" tooltip="Início" />
                    <Button icon={<HomeIcon />} colorScheme="light-green" size="large" path="/" tooltip="Início" />
                    <Button icon={
                                userInfo?.avatarUrl? (
                                    <Image
                                        src={userInfo.avatarUrl}
                                        alt="Foto do usuário"
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <ProfileIcon />
                                )
                            }
                            colorScheme="light-green" 
                            size="large" 
                            path={userInfo?.username? `/${userInfo.username}` : "/perfil"}
                            tooltip="Perfil"
                        />
                    <Button icon={<NotificationsIcon />} colorScheme="light-green" size="large" path="/notificacoes" tooltip="Notificações" />
                    <Button icon={<SettingsIcon />} colorScheme="light-green" size="large" path="/configuracoes" tooltip="Configurações" />
                </div>
                <div>
                    <Button
                        icon={<LogoutIcon />}
                        colorScheme="light-green"
                        size="large"
                        tooltip="Sair"
                        onClick={handleClick}
                    />
                </div>
            </div>
            <ToastNotification />
        </nav>
    );
}