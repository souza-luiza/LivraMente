'use client'

import React from 'react';
import { useLoginForm } from "@/forms/useLoginForm"; 
import Link from 'next/link';
import Image from 'next/image';
import LogoIcon from '@/components/icons/LogoIcon';
import Button from '@/components/button';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';
import Input from '@/components/general-input';

export default function LoginPage() {
  const { 
    formData, errors, isLoading, apiError, handleChange, handleSubmit 
  } = useLoginForm()

  // Containers para manter os ícones estáveis
  const iconContainerStyle = {
    position: 'absolute' as const,
    left: '20px',
    top: '26px', 
    transform: 'translateY(-50%)',
    zIndex: 10,
    pointerEvents: 'none' as const,
    width: '24px',
    height: '24px'
  }

  const iconStyle = {
    width: '24px',
    height: '24px',
    display: 'block' as const
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#E5EEDF] p-4 font-['Poppins']">
      <div className="flex w-full max-w-screen-xl flex-col items-center justify-center gap-12 lg:flex-row">

        {/* Left Side */}
        <div className="flex w-full flex-col items-center justify-center text-center lg:w-1/2">
          <LogoIcon size={200} fill="#3D552F" className="mb-4" />
          <h1 className="text-h1 text-[#3D552F]">LivraMente</h1>
          <p className="text-b1 body-semibold text-[#3D552F]">A rede dos leitores brasileiros</p>
        </div>

        {/* Right Side */}
        <div className="w-full max-w-md rounded-[1.25rem] border border-[#8E572A] bg-[#FFFFFF] p-8 sm:p-12 lg:w-1/2 lg:max-w-none">
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
            
            {/* Erro da API */}
            {apiError && (
              <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {apiError}
              </div>
            )}

            {/* Email Input */}
            <Input 
              id="email"
              name="email"
              type="text"
              label="Email ou nome de usuário"
              placeholder="kemi@gata.com ou @gatanoturna"
              inputSize='medium'
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={errors.email}
            />

            {/* Password Input and Forgot Link */}
            <Input 
              id="password"
              name="password"
              type="password"
              label='Senha'
              placeholder="⁕⁕⁕⁕⁕⁕⁕⁕⁕"
              inputSize='medium'
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={errors.password}
              helperText={<Link href="/esqueci-minha-senha">
                            Esqueci minha senha...
                          </Link>}
            />

            {/* Access Button */}
            <Button
              type='submit'
              disabled={isLoading}
              text='Acessar'
              icon={<ArrowRightIcon />}
              size='small'
              colorScheme='dark-green'
            />

            {/* Separator */}
            <div className="my-2 flex w-full items-center gap-4">
              <div className="h-px flex-grow bg-[#8E806A]"></div>
              <span className="flex-shrink-0 text-b2 text-[#8E806A]">ou</span>
              <div className="h-px flex-grow bg-[#8E806A]"></div>
            </div>

            {/* Google Login */}
            <Button 
              type="button"
              text="Fazer login com Google"
              icon={<Image src="/logos/google-logo.png" alt="Google Logo" width={10} height={10} style={iconStyle} />}
              size="small"
              colorScheme="light-green"
            />

            {/* Apple Login */}
            <Button 
              type="button"
              text="Fazer login com Apple"
              icon={<Image src="/logos/apple-logo.png" alt="Apple Logo" width={10} height={10} style={iconStyle} />}
              size="small"
              colorScheme="light-green"
            />

            {/* Sign-up Link */}
            <div className="mt-4 flex flex-row items-baseline gap-2">
              <span className="text-b2 text-[#BB9A7F]">
                Não tem uma conta?
              </span>
              <Link href="/register" className="text-b2 body-semibold text-[#7BAA5E] hover:underline">
                Inscreva-se
              </Link>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
