"use client";
import Sidebar from "@/components/sidebar";
import SettingsTabs from "./settings-tabs";
import { ChatProvider } from '@/contexts/chat-context';
import WidgetChat from '@/components/widget-chat';

export default function SettingsProfilePage(){
    return (
        <ChatProvider>
        <div className="min-h-screen flex bg-[#eef3eb]">
            <Sidebar />
            <main className="flex-1 flex flex-col p-8">
                <h2 className="text-h2">Configurações</h2>
                <SettingsTabs />
            </main>
            <WidgetChat />
        </div>
        </ChatProvider>
    );
}