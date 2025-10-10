'use client'

import React from 'react';
import { useLoginForm } from "@/hooks/useLoginForm"; 
import Link from 'next/link';
import Image from 'next/image';

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
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 font-['Poppins']">
      <div className="flex w-full max-w-screen-xl flex-col items-center justify-center gap-12 lg:flex-row">

        {/* Left Side */}
        <div className="flex w-full flex-col items-center justify-center text-center lg:w-1/2">
          <Image
            src="/logos/livramente-logo-verde.png"
            alt="Logo"
            className="h-auto w-2/3"
            width={384}
            height={384}
            priority
          />
          <h1 className="text-5xl font-semibold text-[#4C7235]">LivraMente</h1>
          <p className="text-2xl text-[#4C7235]">A rede dos leitores brasileiros</p>
        </div>

        {/* Right Side */}
        <div className="w-full max-w-md rounded-[1.25rem] border border-[#8E572A] bg-[#CADDBF] p-8 sm:p-12 lg:w-1/2 lg:max-w-none">
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
            
            {/* Erro da API */}
            {apiError && (
              <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {apiError}
              </div>
            )}

            {/* Email Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={iconContainerStyle}>
                <Image
                  src="/images/at-sign.svg"
                  alt="Ícone de email"
                  style={iconStyle}
                  width={24}
                  height={24}
                />
              </div>
              <label htmlFor="email" className="sr-only">
                Email ou nome de usuário
              </label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Email ou nome de usuário"
                value={formData.email}
                onChange={handleChange}
                style={{
                  height: '52px',
                  width: '100%',
                  borderRadius: '20px',
                  border: errors.email ? '1px solid #f87171' : '1px solid #E0E0D6',
                  backgroundColor: '#FFFDF7',
                  paddingLeft: '48px',
                  paddingRight: '20px',
                  fontSize: '16px',
                  color: '#A57955',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #7BAA5E'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              {errors.email && (
                <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input and Forgot Link */}
            <div className="flex w-full flex-col items-end gap-1">
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={iconContainerStyle}>
                  <Image
                    src="/images/lock.svg"
                    alt="Ícone de cadeado"
                    style={iconStyle}
                    width={24}
                    height={24}
                  />
                </div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    height: '52px',
                    width: '100%',
                    borderRadius: '20px',
                    border: errors.password ? '1px solid #f87171' : '1px solid #E0E0D6',
                    backgroundColor: '#FFFDF7',
                    paddingLeft: '48px',
                    paddingRight: '20px',
                    fontSize: '16px',
                    color: '#A57955',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #7BAA5E'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
                {errors.password && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>
                    {errors.password}
                  </p>
                )}
              </div>
              <Link href="/esqueci-minha-senha" className="text-sm font-medium text-[#BB9A7F] hover:underline">
                Esqueci minha senha...
              </Link>
            </div>

            {/* Access Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-[3.25rem] w-full items-center justify-center rounded-[1.25rem] border border-[#4D6F39] bg-[#7BAA5E] text-base font-medium text-gray-50 shadow-md transition-colors hover:bg-[#6b9951] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Carregando...' : 'Acessar'}
            </button>

            {/* Separator */}
            <div className="my-2 flex w-full items-center gap-4">
              <div className="h-px flex-grow bg-[#8E806A]"></div>
              <span className="flex-shrink-0 text-sm uppercase text-[#8E806A]">ou</span>
              <div className="h-px flex-grow bg-[#8E806A]"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-[1.25rem] border border-[#4285f4] bg-gray-50 text-base font-medium text-[#4285F4] shadow-md transition-colors hover:bg-gray-200"
            >
              <Image src="/logos/google-logo.png" alt="Google Logo" width={26} height={26} />
              <span>Fazer login com Google</span>
            </button>

            {/* Apple Login */}
            <button
              type="button"
              className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-[1.25rem] border border-[#313131] bg-gray-50 text-base font-medium text-[#494949] shadow-md transition-colors hover:bg-gray-200"
            >
              <Image src="/logos/apple-logo.png" alt="Apple Logo" width={24} height={24} />
              <span>Fazer login com Apple</span>
            </button>

            {/* Sign-up Link */}
            <div className="mt-4 flex flex-row items-baseline gap-2">
              <span className="text-base text-[#BB9A7F]">
                Não tem uma conta?
              </span>
              <Link href="/register" className="text-base font-semibold text-[#7BAA5E] hover:underline">
                Inscreva-se
              </Link>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
