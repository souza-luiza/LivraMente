import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import Link from "next/link";

export default function ReadlistPage() {
    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 flex flex-col gap-2">
                <SearchBar placeholder="Busque no livra..." />

                <div className="w-full bg-[#B0CC9E] medium-border-radius p-6 flex items-end">
                    <Image
                        src={'/Readlist.svg'} 
                        alt={"Imagem da Readlist"} 
                        width={200}
                        height={200}
                        className="object-cover rounded-lg"
                    />
                    <div className="flex flex-col px-5 gap-4">
                        <h2 className="text-h2">Nome da Readlist</h2>
                        <div className="flex items-center gap-2">
                            <Image
                                src={'/AbstractUser.png'}
                                alt="Imagem do autor da readlist"
                                width={30}
                                height={30}
                                className="rounded-full object-cover"
                            />
                            <Link href={'/autor'}>
                                <h6 className="text-h6 hover:underline">Autor</h6>
                            </Link>
                            <p className="text-p">• 15 livros • Readlist Pública</p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-wrap gap-4 p-4">
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                    <Image 
                        src={"/team/Kemi.jpg"} 
                        alt={"Livro da Readlist"}
                        width={130}
                        height={180}
                    />
                </div>
            </main>
        </div>
    )
}