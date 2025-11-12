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
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/services/auth";
import { toast } from "react-toastify";

interface UserData {
    username: string;
    avatarUrl?: string;
}

export default function Sidebar() {
    const { username: loggedUsername } = useAuthStore();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        async function fetchUserData() {
            if (!loggedUsername) return;

            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/users/public/${loggedUsername}`, { credentials: "include" });
                
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        }

        fetchUserData();
    }, [loggedUsername]);

    const handleClick = async () => {
        try {
            await logout();
            window.location.href = '/entrar';
        } catch(err) {
            toast.error('Erro ao deslogar.');
        }
    }

    return (
        <nav data-testid="sidebar" className="light-green h-[calc(100vh-1rem)] sticky top-2 flex flex-col w-fit pt-4 pb-4 m-2 large-border-radius z-50">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-[8px]">   
                    <Button icon={<LogoIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button icon={<HomeIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button 
                        icon={
                            userData?.avatarUrl ? (
                                <Image 
                                    src={userData.avatarUrl} 
                                    alt="Profile" 
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
                        path={userData?.username ? `/${userData.username}` : "/perfil"}
                        tooltip="Perfil"
                    />
                    <Button icon={<NotificationsIcon />} colorScheme="light-green" size="large" path="/" tooltip="Notificações" />
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
        </nav>
    );
}