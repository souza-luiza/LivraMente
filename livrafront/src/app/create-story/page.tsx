
import Sidebar from '@/components/sidebar';
import CreateStory from './story-creator';

export default function CreateStoryPage() {

  return (
    <div className="min-h-screen flex bg-[#eef3eb]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
            <CreateStory />
        </main>
    </div>
  );
}