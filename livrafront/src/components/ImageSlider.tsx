'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
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

export default function ImageSlider({ 
    items, 
    autoPlay = true, 
    autoPlayInterval = 5000,
    height = '400px',
    showOverlay = true
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        if (!autoPlay) return
        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, autoPlayInterval)
        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval, items.length])

    const nextSlide = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % items.length)
    }
    
    const prevSlide = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    }

    const currentItem = items[currentIndex]

    const SlideContent = (
        <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
        >
            <Image
                src={currentItem.imageUrl}
                alt={currentItem.title || `Slide ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority
            />
            
            {/* Overlay com gradiente */}
            {showOverlay && (currentItem.title || currentItem.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            {/* Texto */}
            {(currentItem.title || currentItem.description) && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                >
                    {currentItem.title && (
                        <h2 className="text-h3 font-bold drop-shadow-lg mb-2">
                            {currentItem.title}
                        </h2>
                    )}
                    {currentItem.description && (
                        <p className="text-b1 opacity-90 drop-shadow-md">
                            {currentItem.description}
                        </p>
                    )}
                </motion.div>
            )}
        </motion.div>
    )

    return (
        <div 
            className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-[#1F2A17]"
            style={{ height }}
        >
            {/* Slides */}
            <AnimatePresence initial={false} custom={direction}>
                {currentItem.path ? (
                    <Link href={currentItem.path} className="block absolute inset-0">
                        {SlideContent}
                    </Link>
                ) : (
                    SlideContent
                )}
            </AnimatePresence>

            {/* Botões de navegação */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all duration-300 border border-white/30 cursor-pointer"
                aria-label="Slide anterior"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all duration-300 border border-white/30 cursor-pointer"
                aria-label="Próximo slide"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setDirection(i > currentIndex ? 1 : -1)
                            setCurrentIndex(i)
                        }}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            i === currentIndex 
                                ? 'w-8 bg-white' 
                                : 'w-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Ir para slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Barra de progresso (autoPlay) */}
            {autoPlay && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                    <motion.div
                        key={currentIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                        className="h-full bg-[#5C8046]"
                    />
                </div>
            )}
        </div>
    )
}