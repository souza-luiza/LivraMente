'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface SliderItem {
    imageUrl: string
    title?: string
    description?: string
    path?: string
}

interface ImageSliderProps {
    items: SliderItem[]
    autoPlay?: boolean
    autoPlayInterval?: number
    height?: string
    showOverlay?: boolean
}

// Variantes para animação dos textos (fora do componente para evitar re-criação)
const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3
        }
    }
}

const textItemVariants = {
    hidden: { 
        opacity: 0, 
        y: 30,
        filter: 'blur(4px)'
    },
    visible: { 
        opacity: 1, 
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5,
            ease: 'easeOut' as const
        }
    }
}

export default function ImageSlider({ 
    items, 
    autoPlay = true, 
    autoPlayInterval = 5000,
    height = '400px',
    showOverlay = true
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (!autoPlay || isPaused) return
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, autoPlayInterval)
        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval, items.length, isPaused])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
    }
    
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    }

    const togglePause = () => {
        setIsPaused((prev) => !prev)
    }

    return (
        <div 
            className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-[#1F2A17]"
            style={{ height }}
        >
            {/* Slides */}
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={currentIndex}
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0 }}
                    transition={{ 
                        duration: 0.5,
                        ease: 'easeInOut'
                    }}
                    className="absolute inset-0"
                >
                    {items[currentIndex].path ? (
                        <Link href={items[currentIndex].path!} className="block w-full h-full">
                            <SlideContent 
                                item={items[currentIndex]} 
                                index={currentIndex}
                                showOverlay={showOverlay}
                            />
                        </Link>
                    ) : (
                        <SlideContent 
                            item={items[currentIndex]} 
                            index={currentIndex}
                            showOverlay={showOverlay}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Botões de navegação */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all duration-300 border border-white/30 cursor-pointer z-10"
                aria-label="Slide anterior"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all duration-300 border border-white/30 cursor-pointer z-10"
                aria-label="Próximo slide"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Indicadores + Botão Pause/Play */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                {/* Botão Pause/Play */}
                {autoPlay && (
                    <button
                        onClick={togglePause}
                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all duration-300 border border-white/30 cursor-pointer"
                        aria-label={isPaused ? "Reproduzir" : "Pausar"}
                    >
                        {isPaused ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        )}
                    </button>
                )}
                {/* Indicadores */}
                <div className="flex gap-2">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                i === currentIndex 
                                    ? 'w-8 bg-white' 
                                    : 'w-2 bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Ir para slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Barra de progresso (autoPlay) */}
            {autoPlay && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10 overflow-hidden">
                    <motion.div
                        key={`progress-${currentIndex}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isPaused ? 0 : 1 }}
                        transition={{ 
                            duration: isPaused ? 0 : autoPlayInterval / 1000, 
                            ease: 'linear'
                        }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full w-full bg-[#5C8046]"
                    />
                </div>
            )}
        </div>
    )
}

// Componente separado para o conteúdo do slide (evita re-renders desnecessários que tava rolando na animação do texto)
const SlideContent = React.memo(function SlideContent({ 
    item, 
    index,
    showOverlay 
}: { 
    item: SliderItem
    index: number
    showOverlay: boolean
}) {
    return (
        <div className="relative w-full h-full">
            <Image
                src={item.imageUrl}
                alt={item.title || `Slide ${index + 1}`}
                fill
                className="object-cover"
                priority
            />
            
            {/* Overlay com gradiente */}
            {showOverlay && (item.title || item.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            {/* Texto com animações */}
            {(item.title || item.description) && (
                <motion.div 
                    variants={textContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                >
                    {item.title && (
                        <motion.h2 
                            variants={textItemVariants}
                            className="text-h3 font-bold drop-shadow-lg mb-2"
                        >
                            {item.title}
                        </motion.h2>
                    )}
                    {item.description && (
                        <motion.p 
                            variants={textItemVariants}
                            className="text-b1 opacity-90 drop-shadow-md"
                        >
                            {item.description}
                        </motion.p>
                    )}
                </motion.div>
            )}
        </div>
    )
})