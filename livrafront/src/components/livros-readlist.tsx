"use client";

import { Livro } from "@/types/livro";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./button";
import ClosedBookIcon from "./icons/ClosedBookIcon";
import RemoveIcon from "./icons/RemoveIcon";

interface LivrosReadlistProps {
    livro: Livro;
    isCurrentUserOwner?: boolean;
    handleRemoveBook?: (userId: string) => Promise<void>;
}

export default function LivrosReadlist({ livro, isCurrentUserOwner = false, handleRemoveBook }: LivrosReadlistProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleClick = (e: React.MouseEvent) => {
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
                className="w-full flex flex-row items-center px-2 pb-2 rounded-lg
                    active:opacity-95
                    hover:opacity-90 hover:cursor-pointer
                    disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                onClick={handleClick}
            >
                <Image 
                    src={livro.capa_url || "/team/Kemi.jpg"}
                    alt={`Capa do livro ${livro.titulo}`}
                    width={140}
                    height={160}
                    className="object-cover rounded-lg"
                />
            </motion.div>
            <AnimatePresence mode="wait">
                {isCurrentUserOwner && showOptions &&
                <motion.div 
                    className="fixed z-50 flex flex-col flex-shrink-0 items-center medium-box small-border-width shadow-md bg-white gap-1"
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
                        text={'Visitar Página do Livro'}
                        icon={<ClosedBookIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        path={`/livro/${livro.slug}`}
                        fullwidth={true}
                    />
                    <Button
                        text={'Remover da Readlist'}
                        icon={<RemoveIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={() => handleRemoveBook?.(livro._id!)}
                        fullwidth={true}
                    />
                </motion.div>}
            </AnimatePresence>
        </motion.div>
    );
}