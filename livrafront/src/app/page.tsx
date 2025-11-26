'use client'

import React from 'react';
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/button';
import LoginIcon from '@/components/icons/LoginIcon';
import LogoIcon from '@/components/icons/LogoIcon';
import Edit3Icon from '@/components/icons/Edit3Icon';
import { motion, useAnimation } from 'framer-motion';
import { getSessionInfos } from '@/services/auth';
import OpenBookIcon from '@/components/icons/OpenBookIcon';
import CommunityIcon from '@/components/icons/CommunityIcon';
import StarIcon from '@/components/icons/StarIcon';
import MedalIcon from '@/components/icons/MedalIcon';
import { getProfile } from '@/services/userService';
import { toast } from 'react-toastify/unstyled';
import { UserProfile } from '@/types/users';
import Sidebar from '@/components/sidebar';
import SearchBar from '@/components/searchbar';
import Link from 'next/dist/client/link';
import ImageSlider from '@/components/ImageSlider';

export default function HomePage() {

    // Animação dos LivraBenefícios
    const controls = useAnimation()
    const [index, setIndex] = useState(0)
    const [itemWidth, setItemWidth] = useState(0)
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const itemRef = useRef<HTMLDivElement | null>(null)

    const items = [
        { mainText: 'Acompanhe sua leitura e ganhe XP', description: 'Registre seu progresso e metas' },
        { mainText: 'Conecte-se, desafie e interaja', description: 'Encontre comunidades e engaje-se' },
        { mainText: 'Receba recomendações e avalie', description: 'Compartilhe e descubra novas leituras' },
        { mainText: 'Crie suas próprias histórias', description: 'Crie e expanda universos' },
    ]

    const GAP = 16;

    const sliderItems = [
        {
            imageUrl: '/images/banner-comunidades.jpg',
            title: 'Comunidades',
            description: 'Conecte-se com outros leitores',
            path: '/comunidades',
        },
        {
            imageUrl: '/images/banner-historias.jpg',
            title: 'Crie suas Histórias',
            description: 'Expanda sua criatividade e compartilhe',
            path: '/criar-historia',
        },
        {
            imageUrl: '/images/banner-leitura.jpg',
            title: 'Acompanhe sua Leitura',
            description: 'Registre seu progresso e ganhe XP',
            path: '/leitura',
        },
    ]

    useEffect(() => {
        if (!itemRef.current) return

        const updateWidth = () => {
        if (itemRef.current) setItemWidth(itemRef.current.offsetWidth)
        }

        updateWidth()

        // Only create a ResizeObserver when available (Jest/node environments may not provide it)
        if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(updateWidth)
        resizeObserver.observe(itemRef.current)

        return () => resizeObserver.disconnect()
        }

        // If ResizeObserver is not present (tests/SSR), provide a no-op cleanup
        return () => {}
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % items.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [items.length])

    useEffect(() => {
        if (!itemWidth) return
        controls.start({
        x: -index * (itemWidth + GAP),
        transition: { type: 'spring', stiffness: 80, damping: 20 },
        })
    }, [index, itemWidth, controls])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const info = await getSessionInfos();
                if(!info) {
                    setIsLoggedIn(false);
                    return;
                }
                else{
                    setIsLoggedIn(true);
                }

                // Carrega perfil + readlists:
                const data = await getProfile(info.username);
                setUserData(data);
            } catch (error) {
                toast.error("Erro ao carregar dados do usuário.");
                setError(error instanceof Error ? error.message : 'Erro ao carregar perfil do usuário');
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, []);
    if (isLoading) {
        return (
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <main className="flex-1 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]" />
                        <div className="w-24 h-24 text-[#1F2A17]">
                            <LogoIcon />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!isLoggedIn) {
    return(
        <div className="w-screen h-screen flex flex-row bg-[#B0CC9E]">

            {/*Parte da Esquerda*/}
            <div data-testid="left-section" className="w-1/4 h-screen flex justify-start">
                <div className="m-[16px]">
                    <Button
                        text="LivraTime"
                        icon={<LogoIcon />}
                        colorScheme="dark-brown"
                        size="medium"
                        path="/livratime"
                    />
                </div>
            </div>

            {/*Parte Central*/}
            <div role="main" data-testid="center-section" className="w-1/2 h-screen flex flex-col justify-center items-center bg-[#FFFFFF] gap-8">

                {/*Logo*/}
                <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5, ease: "easeInOut" }} 
                className="flex flex-col items-center text-[#23160A]"
                >
                    <LogoIcon size={160} fill="#23160A" />
                    <div className="text-center">
                        <h1 className="text-h1">
                            LivraMente
                        </h1>
                        <p className="text-b1 body-semibold">
                            A rede dos leitores brasileiros
                        </p>
                    </div>
                </motion.div>

                {/*LivraBenefícios*/}
                <div data-testid="benefits-container" className="w-6/11 overflow-hidden">
                    <motion.div className="flex gap-[16px]" animate={controls}>
                    {items.map((livraPerk, i) => (
                        <div
                            key={i}
                            ref={i === 0 ? itemRef : null}
                            className="flex-shrink-0 w-full text-center text-[#2B0F05] bg-[#D67F4D90] rounded-[12px] p-[16px]"
                        >
                            <div className="flex flex-col items-center justify-center gap-2">
                                {i == 0 && <MedalIcon size={40} fill="#2B0F05" />}
                                {i == 1 && <CommunityIcon size={40} fill="#2B0F05" />}
                                {i == 2 && <StarIcon size={40} fill="#2B0F05" />}
                                {i == 3 && <OpenBookIcon size={40} fill="#2B0F05" />}
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-h6 mb-2">{livraPerk.mainText}</p>
                                    <p className="text-b2 body-semibold">{livraPerk.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </motion.div>
                </div>

            </div>
            
            {/*Parte da Direita*/}
            <div data-testid="right-section" className="w-1/4 h-screen flex justify-end">

                {/*Botões de Entrar & Cadastrar*/}
                <div className="flex flex-row gap-1 m-[16px]">
                    <Button 
                        text="Entrar"
                        colorScheme="dark-brown"
                        size="medium"
                        icon={<LoginIcon />}
                        path="/entrar"
                    />
                    <Button 
                        text="Cadastrar"
                        colorScheme="dark-brown"
                        size="medium"
                        icon={<Edit3Icon />}
                        path="/cadastro"
                    />
                </div>

            </div>

        </div>
    )}
    if(isLoggedIn){
        return(
            <div className="min-h-screen flex bg-[#E5EEDF]">
                <Sidebar />
                <div className='w-full flex flex-col'>
                    <nav className=''>
                        <SearchBar/>
                    </nav>
                    <main className="flex-1 flex flex-col items-center">
                        <div className="flex w-full p-4">
                            <ImageSlider 
                                items={sliderItems} 
                                autoPlay={true} 
                                autoPlayInterval={5000}
                                height="400px"
                            />
                        </div>
                        <div className="relative flex items-center justify-center">
                            <div className='flex flex-col gap-4 align-middle items-center'>
                                <Button icon={<CommunityIcon />} colorScheme="dark-green" size="large" path="/comunidades" text="Comunidades" />
                                <Button icon={<OpenBookIcon />} colorScheme="dark-green" size="large" path="/criar-historia" text="Criar História" />
                                <Button icon={<LogoIcon/>} colorScheme='dark-green' size='large' path='/livratime' text='Créditos'/>
                            </div>  
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}
