"use client";
import Sidebar from "@/components/sidebar";
import ComunidadesTabs from "./comunidades-tab";
import Button from "@/components/button";
import AddIcon from "@/components/icons/AddIcon";
import { ChatProvider } from '@/contexts/chat-context';
import WidgetChat from '@/components/widget-chat';

export default function ComunidadesPage() {
    return (
        <ChatProvider>
        <div className="flex min-h-screen bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col p-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-h2">Comunidades</h2>
                    <Button
                        text="Criar Comunidade"
                        icon={<AddIcon />}
                        colorScheme="dark-green"
                        size="medium"
                        path="/comunidades/criar"
                    />
                </div>
                <ComunidadesTabs />
            </main>
            <WidgetChat />
        </div>
        </ChatProvider>
    )
}