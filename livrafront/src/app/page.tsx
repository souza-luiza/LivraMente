'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    return(
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-full relative" style={{ backgroundColor: '#E5EEDF' }}>
                <div className="flex flex-col justify-center items-center w-full p-12 text-black">
                    <Link href="/">
                        <Image src="/logo-vetorizada.svg" alt="Logo" width={150} height={150} className="mb-4"/>
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">LivraMente</h1>
                    <p className="text-lg mb-8">Página Provisória</p>
                    <div className="flex flex-row justify-center items-center w-full p-4 gap-2 text-black">
                        <Link href="/register">
                            <Button 
                                text="Registre-se"
                                colorScheme="dark-green"
                                size="small"
                                icon={<span><Image src="/icons/register.svg" alt="Ícone de casa" width={48} height={48} /></span>}
                            />
                        </Link>
                        <Link href="/login">
                            <Button 
                                text="Login"
                                colorScheme="dark-green"
                                size="small"
                                icon={<span><Image src="/icons/enter.svg" alt="Ícone de casa" width={48} height={48} /></span>}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}