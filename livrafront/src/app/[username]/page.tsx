import { notFound } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import ProfileIcon from "@/components/icons/ProfileIcon";
import EditIcon from "@/components/icons/EditIcon";
import ProfileReadlists from "@/components/profile-readlists";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import Readlist from "@/components/readlist";
import Post from "@/components/post";

interface UserProfilePageProps {
    params: Promise<{username: string}>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps){
    const { username } = await params;
    const pronouns = "ele/dele"; // Exemplo estático, substituir pela lógica real
    
    // Implementar a lógica para confirmar se usuário existe no banco de dados
    // Se não existir, chamar notFound()
    if(!username){
        notFound();
    }
    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center p-4">
                <div className="w-48 h-48 mb-4">
                    <ProfileIcon size={190} className="text-gray-400" />
                </div>
                <h4 className="text-3xl font-bold pb-2 text-h5">@{username}</h4>
                <p className="pb-4 text-b1 body-quotation">{pronouns}</p>
                <Link href={`/edit-profile/${username}`}>
                    <Button text="Editar Perfil" colorScheme="dark-brown" size="medium" icon={<EditIcon />} />
                </Link>
                <div className="w-full h-fit flex justify-center items-center mt-8 gap-4">
                    <div className="w-1/2 h-fit bg-white rounded-lg p-4 my-4">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/readlists`}>Readlists<ArrowRightIcon width={24} height={24}/></Link>
                        <ProfileReadlists />
                    </div>
                    <div className="w-1/2 my-4">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/posts`}>Postagens<ArrowRightIcon width={24} height={24}/></Link>
                        <Post 
                            id="1" 
                            community="Jogos Vorazes" 
                            author={username} 
                            content={`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. \n\nLorem Ipsum is simply dummy text of the printing and typesetting industry.`} 
                            commentsCount={5} 
                            likesCount={10} />
                    </div>
                </div>
            </main>
        </div>
    );
}