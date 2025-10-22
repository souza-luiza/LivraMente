import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import SettingsTabs from "./settings-tabs";

export default async function UserProfilePage(){
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