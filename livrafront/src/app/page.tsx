'use client'

import React from 'react';
import Link from 'next/link';
import Button from '@/components/button';
import LoginIcon from '@/components/icons/LoginIcon';
import LogoIcon from '@/components/icons/LogoIcon';
import Edit3Icon from '@/components/icons/Edit3Icon';
import { motion } from 'framer-motion';

export default function HomePage() {
    return(
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-full relative" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex flex-col justify-center items-center w-full gap-4">
                    <motion.div 
                    initial={{ opacity: 0, rotateY: 0 }}
                    animate={{ opacity: 100, rotateY: 360 }} 
                    transition={{ duration: 1.5, ease: "easeInOut" }} 
                    className="flex flex-col items-center text-[#1F2A17]"
                    >
                        <LogoIcon size={160} fill="#1F2A17" className="mb-2" />
                        <h1 className="text-h1">
                            LivraMente
                        </h1>
                        <p className="text-b1 body-semibold">
                            A rede dos leitores brasileiros
                        </p>
                    </motion.div>

                    <div className="flex flex-row justify-center items-center w-full p-4 gap-2">
                        <Link href="/login">
                            <Button 
                                text="Entrar"
                                colorScheme="dark-green"
                                size="large"
                                icon={<LoginIcon />}
                            />
                        </Link>
                        <Link href="/register">
                            <Button 
                                text="Cadastrar"
                                colorScheme="dark-green"
                                size="large"
                                icon={<Edit3Icon />}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
