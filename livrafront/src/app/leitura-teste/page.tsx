'use client'

import RegistroLeitura from '@/components/registro-leitura';

export default function LeituraTestePage() {
    return (
        <div className="h-screen w-screen bg-[#F1F1F1]">
            <h1 className='text-h1'>Teste</h1>
            <p className="text-b1">Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <RegistroLeitura isLoggedIn={true} />
        </div>
    )
}