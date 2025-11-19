"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "./button";
import SingleUserIcon from "./icons/SingleUserIcon";
import RemoveIcon from "./icons/RemoveIcon";
import ToolIcon from "./icons/ToolIcon";
import StarIcon from "./icons/StarIcon";
import { User } from "@/types/auth";
import Image from "next/image";

interface CommunityMemberProps {
    user: User;
    isCurrentUserModerator?: boolean;
    isTargetUserModerator?: boolean;
    handleRemoveMember?: (userId: string) => Promise<void>;
    handleMakeModerator?: (userId: string) => Promise<void>;
}

export default function CommunityMember({ 
    user,
    isCurrentUserModerator = false,
    isTargetUserModerator = false, 
    handleRemoveMember, 
    handleMakeModerator 
}: CommunityMemberProps) {
        
    const router = useRouter();
    const [showOptions, setShowOptions] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleClick = (e: React.MouseEvent) => {
        if (!isCurrentUserModerator || isTargetUserModerator) {
            router.push(`/${user.username}`);
            return;
        }

        const { clientX, clientY } = e;
        const menuWidth = 250;
        const menuHeight = 200;

        const x = clientX + menuWidth > window.innerWidth 
            ? window.innerWidth - menuWidth - 10 
            : clientX;

        const y = clientY + menuHeight > window.innerHeight 
            ? window.innerHeight - menuHeight - 10 
            : clientY;

        setClickPosition({ x, y });
        setShowOptions((prev) => !prev);
    };

    return (
        <motion.div
            className="flex flex-col items-center gap-2"
            onHoverEnd={() => setShowOptions(false)}
        >
            <motion.div 
                className="w-full flex flex-row items-center medium-box text-h6 text-[#1F2A17] bg-[#E5EEDF] gap-2
                    active:opacity-95
                    hover:opacity-90 hover:cursor-pointer
                    disabled:opacity-70 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 }, backgroundColor: '#E3A988', color: '#2B0F05' }}
                onClick={handleClick}
            >
                {isTargetUserModerator && <StarIcon size={20}/>}
                <div className="flex flex-row gap-1">
                    <Image
                        src={user.avatarUrl ? user.avatarUrl : '/AbstractUser.png'}
                        alt="Foto do usuário"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    @{user.username}
                </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
                {isCurrentUserModerator && !isTargetUserModerator && showOptions &&
                <motion.div 
                    className="fixed z-50 flex flex-col flex-shrink-0 items-center medium-box small-border-width border-gray-300 shadow-md bg-white gap-1"
                    style={{
                        top: clickPosition.y,
                        left: clickPosition.x
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    onMouseLeave={() => setShowOptions(false)}
                >    
                    <Button
                        text={user.username ? `Visitar perfil de @${user.username}` : 'Visitar Perfil'}
                        icon={<SingleUserIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        path={user.username ? `/${user.username}` : '/not-found'}
                        fullwidth={true}
                    />
                    <Button
                        text={user.username ? `Remover @${user.username} da comunidade` : 'Remover da Comunidade'}
                        icon={<RemoveIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={() => handleRemoveMember?.(user.userId!)}
                        fullwidth={true}
                    />
                    <Button
                        text={user.username ? `Tornar @${user.username} moderador` : 'Tornar Moderador'}
                        icon={<ToolIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={() => handleMakeModerator?.(user.userId!)}
                        fullwidth={true}
                    />
                </motion.div>}
            </AnimatePresence>
        </motion.div>
    );
}