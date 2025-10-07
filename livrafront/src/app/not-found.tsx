'use client'

import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
    return(
        <div className="">
            <h1>Página não encontrada</h1>
            <p>Desculpe, a página que você está procurando não existe.</p>
            <Link href="/">Voltar para a página inicial</Link>
        </div>
    )
}