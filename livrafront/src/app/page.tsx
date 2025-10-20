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
        <div className="w-screen h-screen flex flex-row bg-[#B0CC9E]">

            <div className="w-1/4 h-screen flex justify-start">
            </div>

            <div className="w-1/2 h-screen flex flex-col justify-center items-center bg-[#FFFFFF] gap-4">
                    <motion.div 
                    initial={{ opacity: 0, rotateY: -180 }}
                    animate={{ opacity: 1, rotateY: 0 }} 
                    transition={{ duration: 0.8, ease: "easeInOut" }} 
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

                    <div className="flex flex-row justify-center items-center gap-1">
                        <Link href="/login">
                            <Button 
                                text="Entrar"
                                colorScheme="dark-brown"
                                size="large"
                                icon={<LoginIcon />}
                            />
                        </Link>
                        <Link href="/register">
                            <Button 
                                text="Cadastrar"
                                colorScheme="dark-brown"
                                size="large"
                                icon={<Edit3Icon />}
                            />
                        </Link>
                    </div>
            </div>

            <div className="w-1/4 h-screen flex justify-end">
                <div className="m-[16px]">
                    <Link href="/LivraTime" >
                        <Button
                            text="LivraTime"
                            icon={<CommunityIcon />}
                            colorScheme="dark-brown"
                            size="medium"
                        />
                    </Link>
                </div>
            </div>

        </div>
    )
}
