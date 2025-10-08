'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    }

    return(
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-full relative" style={{ backgroundColor: '#E5EEDF' }}>
                <div className="flex flex-col justify-center items-center w-full p-12 text-black">
                    <Link href="/">
                        <Image src="/logos/LivraMenteErrorPreto.svg" alt="Logo" width={250} height={250} className="mb-4"/>
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                    <p className="text-lg mb-8">A página que você está procurando não foi encontrada.</p>
                    <div className="flex flex-col justify-center items-center w-full p-4 gap-2 text-black">
                        <p className="text-lg mb-4">Código de Erro: 404</p>
                        <Link href="/">
                            <Button 
                                text="Página Inicial"
                                colorScheme="dark-green"
                                size="small"
                                icon={<span><Image src="/icons/homeFilledWhite.svg" alt="Ícone de casa" width={48} height={48} /></span>}
                            />
                        </Link>
                        <Button 
                            onClick={handleGoBack}
                            text="Voltar"
                            colorScheme="dark-green"
                            size="small"
                            icon={<span><Image src="/icons/chevronLeft.svg" alt="Ícone de seta" width={48} height={48} /></span>}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}