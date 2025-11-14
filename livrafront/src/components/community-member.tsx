"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "./button";
import SingleUserIcon from "./icons/SingleUserIcon";
import RemoveIcon from "./icons/RemoveIcon";
import ToolIcon from "./icons/ToolIcon";
import StarIcon from "./icons/StarIcon";

interface CommunityMemberProps {
    userId: string;
    username: string;
    isCurrentUserModerator?: boolean;
    isTargetUserModerator?: boolean;
    handleRemoveMember?: (userId: string) => Promise<void>;
    handleMakeModerator?: (userId: string) => Promise<void>;
}

export default function CommunityMember({ 
    userId,
    username, 
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
            router.push(`/${username}`);
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
                @{username}
            </motion.div>
            
            <AnimatePresence mode="wait">
                {isCurrentUserModerator && !isTargetUserModerator && showOptions &&
                <motion.div 
                    className="fixed max-w-64 flex flex-col flex-shrink-0 items-center small-padding medium-border-radius large-border-width border-[var(--secondary-700)] bg-gray-50 gap-1"
                    style={{
                        top: clickPosition.y,
                        left: clickPosition.x
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    onMouseLeave={() => setShowOptions(false)}
                >    
                    <Button
                        text={username ? `Visitar perfil de @${username}` : 'Visitar Perfil'}
                        icon={<SingleUserIcon />}
                        size="small"
                        colorScheme="light-brown"
                        path={username ? `/${username}` : '/not-found'}
                    />
                    <Button
                        text={username ? `Remover @${username} da comunidade` : 'Remover da Comunidade'}
                        icon={<RemoveIcon />}
                        size="small"
                        colorScheme="light-brown"
                        onClick={() => handleRemoveMember?.(userId!)}
                    />
                    <Button
                        text={username ? `Tornar @${username} moderador` : 'Tornar Moderador'}
                        icon={<ToolIcon />}
                        size="small"
                        colorScheme="light-brown"
                        onClick={() => handleMakeModerator?.(userId!)}
                    />
                </motion.div>}
            </AnimatePresence>
        </motion.div>
    );
}