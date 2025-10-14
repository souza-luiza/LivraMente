'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import LoginIcon from '@/components/icons/LoginIcon';
import LogoIcon from '@/components/icons/LogoIcon';
import FolderIcon from '@/components/icons/FolderIcon';

export default function HomePage() {
    return(
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-full relative" style={{ backgroundColor: '#CADDBF' }}>
                <div className="flex flex-col justify-center items-center w-full p-12">
                    <div className="flex flex-col items-center text-[#1F2A17]">
                        <LogoIcon size={160} fill="#1F2A17" className="mb-2" />
                        <h1 className="text-h1">
                            LivraMente
                        </h1>
                        <p className="text-b1 body-semibold">
                            A rede dos leitores brasileiros
                        </p>
                    </div>
                    <p className="text-b2 mt-8 mb-4">Página Inicial Provisória</p>
                    <div className="flex flex-row justify-center items-center w-full p-4 gap-2">
                        <Link href="/register">
                            <Button 
                                text="Cadastre-se"
                                colorScheme="dark-green"
                                size="medium"
                                icon={<FolderIcon />}
                            />
                        </Link>
                        <Link href="/login">
                            <Button 
                                text="Entrar"
                                colorScheme="dark-green"
                                size="medium"
                                icon={<LoginIcon />}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}