import { notFound } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import ProfileIcon from "@/components/icons/ProfileIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

interface UserProfilePageProps {
    params: Promise<{username: string}>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps){
    const { username } = await params;
    
    // Implementar a lógica para confirmar se usuário existe no banco de dados
    // Se não existir, chamar notFound()
    if(!username){
        notFound();
    }
    return (
        <div className="min-h-screen flex bg-[#E5EEDF]">
            <Sidebar />
            <main className="flex-1 flex flex-col items-center p-4 overflow-y-hidden">
                {/* Your profile content goes here */}
                <h1 className="text-3xl font-bold mb-4">Perfil de {username}</h1>
                <div className="w-32 h-32 mb-4">
                    <Image
                        src="/default-profile.png" // Substitua pelo caminho da imagem padrão
                        alt="Foto de perfil"
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                    />
                </div>
                <p className="text-lg mb-4">Este é o perfil de {username}. Mais informações podem ser adicionadas aqui.</p>
                <Link href={`/edit-profile/${username}`}>
                    <Button text="Editar Perfil" colorScheme="dark-brown" size="medium" icon={<ProfileIcon />} />
                </Link>

                <div className="mt-4">
                    <Button text="Voltar" colorScheme="light-green" size="medium" icon={<ArrowRightIcon />} />
                </div>
                <h1 className="text-9xl">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta dolorum libero quibusdam tempore deleniti tenetur enim, dolore in modi voluptas id excepturi velit, nam ex cumque! Voluptas minus labore cupiditate?
                    Ipsum dolor sit amet consectetur adipisicing elit. Dicta dolorum libero quibusdam tempore deleniti tenetur enim, dolore in modi voluptas id excepturi velit, nam ex cumque! Voluptas minus labore cupiditate?
                </h1>

            </main>
        </div>
    );
}