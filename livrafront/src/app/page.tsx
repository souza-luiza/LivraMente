'use client'

import React from 'react';
import Link from 'next/link';
import Button from '@/components/button';
import LoginIcon from '@/components/icons/LoginIcon';
import LogoIcon from '@/components/icons/LogoIcon';
import Edit3Icon from '@/components/icons/Edit3Icon';
import { motion } from 'framer-motion';
import CommunityIcon from '@/components/icons/CommunityIcon';

export default function HomePage() {
    return(
        <div className="w-screen h-screen flex flex-row bg-[#8E572A]">
            <div className="w-1/4 h-screen flex justify-start">
                <div className="flex flex-row m-[8px] gap-[8px]">
                    <LogoIcon size={30} fill="#23160A" />
                    <p className="text-b1 body-quotation">
                        LivraMente
                    </p>
                </div>
            </div>
            <div className="w-1/2 h-screen flex flex-col justify-center items-center bg-[#E5EEDF40] gap-4">
                    <motion.div 
                    initial={{ opacity: 0, rotateY: 0 }}
                    animate={{ opacity: 100, rotateY: 360 }} 
                    transition={{ duration: 1.5, ease: "easeInOut" }} 
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

                    <div className="flex flex-col justify-center items-center gap-2">
                        <Link href="/login">
                            <Button 
                                text="Entrar"
                                colorScheme="light-green"
                                size="large"
                                icon={<LoginIcon />}
                            />
                        </Link>
                        <Link href="/register">
                            <Button 
                                text="Cadastrar"
                                colorScheme="light-green"
                                size="large"
                                icon={<Edit3Icon />}
                            />
                        </Link>
                    </div>
            </div>
            <div className="w-1/4 h-screen flex justify-end">
                <div className="m-[8px]">
                    <Button
                        text="Sobre Nós"
                        icon={<CommunityIcon />}
                        colorScheme="dark-brown"
                        size="small"
                    />
                </div>
            </div>
        </div>
    )
}
