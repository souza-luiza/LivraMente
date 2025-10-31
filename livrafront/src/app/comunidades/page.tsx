import Sidebar from "@/components/sidebar";
import ComunidadesTabs from "./comunidades-tab";

export default function CommunitiesPage() {
    return (
        <div className="flex min-h-screen bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col p-8">
                <h2 className="text-h2 mb-4">Comunidades</h2>
                <ComunidadesTabs />
            </main>
        </div>
    )
}