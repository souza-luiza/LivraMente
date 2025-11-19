"use client";

import { useRef, useState, useEffect } from "react";
import Readlist from "@/components/readlist";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import ProfileIcon from "./profile-icon";

interface UserItem {
    id: string;
    username: string;
    avatarUrl: string;
}

interface UsersCarouselProps {
    users: UserItem[];
}

export default function UsersCarousel({ users }: UsersCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320;
            const newScrollPosition = scrollContainerRef.current.scrollLeft + 
                (direction === 'right' ? scrollAmount : -scrollAmount);
            
            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group w-full overflow-hidden">
            {/* Gradiente Esquerda */}
            {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#E5EEDF] via-[#E5EEDF]/80 to-transparent z-10 pointer-events-none" />
            )}
            
            {/* Gradiente Direita */}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#E5EEDF] via-[#E5EEDF]/80 to-transparent z-10 pointer-events-none" />
            )}

            {/* Botão Esquerda */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon size={24} />
                </button>
            )}

            {/* Container do Carrossel */}
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 py-4 scroll-smooth"
                style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none'
                }}
            >
                {users.map((user) => (
                    <div key={user.id} className="flex-shrink-0 w-[220px] rounded-full items-center justify-center flex flex-col">
                        <ProfileIcon username={user.username} avatarUrl={user.avatarUrl} size={144} showProgress={false}/>
                        <p className="mt-2 text-h6">{user.username}</p>
                    </div>
                ))}
            </div>

            {/* Botão Direita */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Próximo"
                >
                    <ChevronRightIcon size={24} />
                </button>
            )}

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}