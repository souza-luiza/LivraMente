"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Sidebar from "@/components/sidebar";
import SettingsTabs from "./settings-tabs";
import LoadingPage from "@/components/loading";

export default function SettingsProfilePage(){
    const router = useRouter();
    const { isAuthenticated, username } = useAuthStore();

    useEffect(() => {
        // Verifica se o usuário está autenticado
        if (!isAuthenticated || !username) {
            router.push('/entrar');
        }
    }, [isAuthenticated, username, router]);

    // Enquanto verifica a autenticação, mostra loading
    if (!isAuthenticated || !username) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#eef3eb]">
                <div className="text-center">
                    <LoadingPage/>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#eef3eb]">
            <Sidebar />
            <main className="flex-1 flex flex-col p-8">
                <h2 className="text-h2">Configurações</h2>
                <SettingsTabs />
            </main>
        </div>
    );
}