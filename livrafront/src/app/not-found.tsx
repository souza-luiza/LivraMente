'use client'

import React from 'react';
import Link from 'next/link';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import ErrorIcon from '@/components/icons/ErrorIcon';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

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
                        <ErrorIcon size={120} fill="#1F2A17" className="mb-4" aria-label="Logo" role="img" />
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                    <p className="text-lg mb-8">A página que você está procurando não foi encontrada.</p>
                    <div className="flex flex-col justify-center items-center w-full p-4 text-black">
                        <p className="text-lg mb-4">Código de Erro: 404</p>
                        <Button 
                            onClick={handleGoBack}
                            text="Voltar"
                            colorScheme="dark-green"
                            size="medium"
                            icon={<ArrowLeftIcon aria-label="Ícone de seta" role="img" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}