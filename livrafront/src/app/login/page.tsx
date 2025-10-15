'use client'

import React from 'react';
import { useLoginForm } from "@/hooks/useLoginForm"; 
import Link from 'next/link';
import LogoIcon from '@/components/icons/LogoIcon';
import Button from '@/components/button';
import Input from '@/components/general-input';
import LoginIcon from '@/components/icons/LoginIcon';

export default function LoginPage() {
  const { 
    formData, errors, isLoading, apiError, handleChange, handleSubmit 
  } = useLoginForm()

  const iconStyle = {
    width: '24px',
    height: '24px',
    display: 'block' as const
  }

  return (
      <div className="flex min-h-screen">
        {/* Left Side */} 
        <div className="flex-1 bg-[#5C8046]">
          <div className="flex flex-col items-center justify-center h-full text-[#E5EEDF]">
            <LogoIcon size={160} fill="#E5EEDF" className="mb-2" />
            <h1 className="text-h1">
              LivraMente
            </h1>
            <p className="text-b1 body-semibold">
              A rede dos leitores brasileiros
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-gray-50">
          <div className="flex flex-col items-center h-full justify-center p-8">
          <form onSubmit={handleSubmit} className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
            
            {/* Erro da API */}
            {apiError && (
              <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {apiError}
              </div>
            )}

            <div className="mb-6 mt-4">
              <h2 className="text-b1 body-semibold text-center text-gray-900">
                Entre no Livra!
              </h2>
              <p className="text-b3 text-center text-gray-600 mt-1">
                Acesse sua conta
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Input 
                id="email"
                name="email"
                type="text"
                label="E-mail"
                placeholder="kemi@gata.miau"
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
              />
            </div>

            {/* Access Button */}
            <div className="mt-4 mb-4">
              <Button
                type='submit'
                disabled={isLoading}
                text='Entrar'
                icon={<LoginIcon />}
                size='medium'
                colorScheme='dark-green'
              />
            </div>

            <div className="flex flex-row items-baseline gap-1 mb-2">
              <Link href="/esqueci-minha-senha" className="text-b3 body-semibold text-[#3D552F] hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            {/* Sign-up Link */}
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-b3 text-gray-900">
                Não tem uma conta?
              </span>
              <Link href="/register" className="text-b3 body-semibold text-[#3D552F] hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
          </div>
        </div>
      </div>
  );
}
