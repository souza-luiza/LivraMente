import ProgressoLivros from "@/components/progresso-livros";
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";

export default function ReadlistPage() {
    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <SearchBar />

                <main className="bg-[#E8DDD4] w-1/6 flex flex-col medium-border-radius p-5 text-[var(--secondary-700)]">
                    <div className="relative w-full aspect-[1/1]">
                        <Image 
                            src={"/team/Kemi.jpg"}
                            alt={"Foto da readlist"}
                            fill
                            className="object-cover rounded-lg" 
                        />
                    </div>
                    <h4 className="text-h4 pt-2 text-center break-words">Readlist</h4>
                    <div className="flex flex-row justify-center items-center gap-1 pt-2 pb-6">
                        <Image 
                            src="/AbstractUser.png"
                            alt="Foto do dono da readlist"
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                        />
                        <p className="text-b2">@username</p>
                    </div>
                    <ProgressoLivros lidos={2} total={5}/>
                </main>


            </div>
        </div>
    )
}