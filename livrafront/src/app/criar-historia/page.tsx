"use client";
import Sidebar from '@/components/sidebar';
import CreateStory from './story-creator';
import { ChatProvider } from '@/contexts/chat-context';
import WidgetChat from '@/components/widget-chat';

export default function CreateStoryPage() {

  return (
    <ChatProvider>
    <div className="min-h-screen flex bg-[#eef3eb]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
            <CreateStory />
        </main>
        <WidgetChat />
    </div>
    </ChatProvider>
  );
}