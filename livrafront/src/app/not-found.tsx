'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/button';

export default function NotFoundPage() {
    return(
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-full relative" style={{ backgroundColor: '#E5EEDF' }}>
                <div className="flex flex-col justify-center items-center w-full p-12 text-black">
                <Image src="/logo-vetorizada.svg" alt="Logo" width={100} height={100} className="mb-4"/>
                <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                <p className="text-lg mb-8">A página que você está procurando não foi encontrada.</p>
                <Link href="/">
                    <Button 
                        text="Página Inicial"
                        colorScheme="dark-green"
                        size="medium"
                        icon={<span>🏠</span>}
                    />
                </Link>
                </div>
            </div>
        </div>
    )
}