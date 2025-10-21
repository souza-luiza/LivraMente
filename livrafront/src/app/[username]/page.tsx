import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import ProfileIcon from "@/components/profile-icon";
import EditIcon from "@/components/icons/EditIcon";
import ProfileReadlists from "@/components/profile-readlists";
import ProfilePosts from "@/components/profile-posts";
import ProfileBadge from "@/components/profile-badge";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";

interface UserProfilePageProps {
    params: Promise<{username: string}>;
}

const userProfile = {
    pronouns: "ele/dele", // Exemplo estático, substituir pela lógica real quando implementar a API
    level: 15,
    percentage: 67,
}

export default async function UserProfilePage({ params }: UserProfilePageProps){
    const { username } = await params;
    
    // Implementar a lógica para confirmar se usuário existe no banco de dados
    // Se não existir, chamar notFound()
    if (!username || username.trim() === '') {
        notFound();
    }
    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center p-4">
                <div className="w-48 h-48 mb-4 relative">
                    <ProfileIcon size={190} percentage={userProfile.percentage} className="text-[var(--success-700)]" />
                    <div className="absolute top-0 right-0 -translate-y-0 translate-x-12">
                        <ProfileBadge content={userProfile.level} width={60} height={30} />
                    </div>
                </div>
                <h4 className="text-3xl font-bold pb-2 text-h5">@{username}</h4>
                <p className="pb-4 text-b1 body-quotation">{userProfile.pronouns}</p>
                <Link href={`/edit-profile/${username}`}>
                    <Button text="Editar Perfil" colorScheme="dark-brown" size="medium" icon={<EditIcon />} />
                </Link>
                <div className="w-full flex justify-center items-stretch mt-8 gap-4">
                    <div className="w-1/2 bg-white rounded-lg p-4 my-4 flex flex-col">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/readlists`}>Readlists<ChevronRightIcon width={24} height={24}/></Link>
                        <div className="flex-1 overflow-y-auto">
                            <ProfileReadlists />
                        </div>
                    </div>
                    <div className="w-1/2 bg-white rounded-lg p-4 my-4 flex flex-col">
                        <Link className="text-h4 body-underline flex items-center gap-2 pb-4" href={`/${username}/posts`}>Postagens<ChevronRightIcon width={24} height={24}/></Link>
                        <div className="flex-1 overflow-y-auto">
                            <ProfilePosts username={username} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}