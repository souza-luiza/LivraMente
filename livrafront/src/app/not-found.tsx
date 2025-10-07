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
                    <Image src="/logos/LivraMenteErrorPreto.svg" alt="Logo" width={250} height={250} className="mb-4"/>
                    <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                    <p className="text-lg mb-8">A página que você está procurando não foi encontrada.</p>
                    <div className="flex flex-col justify-center items-center w-full p-4 text-black">
                        <p className="text-lg mb-4">Código de Erro: 404</p>
                        <Link href="/">
                            <Button 
                                text="Página Inicial"
                                colorScheme="dark-green"
                                size="small"
                                icon={<span><Image src="/icons/Home_Filled_White.svg" alt="Ícone de casa" width={48} height={48} /></span>}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}