import React from 'react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 font-['Poppins']">
      <div className="flex w-full max-w-screen-xl flex-col items-center justify-center gap-12 lg:flex-row">

        {/* Left Side */}
        <div className="flex w-full flex-col items-center justify-center text-center lg:w-1/2">
          <img
            src="/logos/livramente-logo-verde.png"
            alt="Logo"
            className="h-auto w-2/3 max-w-[24rem] max-h-[24rem]"
          />
          <h1 className="text-5xl font-semibold text-[#4C7235]">LivraMente</h1>
          <p className="text-2xl text-[#4C7235]">A rede dos leitores brasileiros</p>
        </div>

        {/* Right Side */}
        <div className="w-full max-w-md rounded-[1.25rem] border border-[#8E572A] bg-[#CADDBF] p-8 sm:p-12 lg:w-1/2 lg:max-w-none">
          <form className="flex w-full flex-col items-center gap-4">

            {/* Email Input */}
            <div className="relative w-full">
              <img
                src="/images/at-sign.svg"
                alt="Ícone de email"
                className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 transform w-[1.5rem] h-[1.5rem]"
              />
              <label htmlFor="email" className="sr-only">
                Email ou nome de usuário
              </label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Email ou nome de usuário"
                className="h-[3.25rem] w-full rounded-[1.25rem] border border-[#E0E0D6] bg-[#FFFDF7] pl-12 pr-5 text-base text-[#A57955] placeholder:text-[#A57955] focus:outline-none focus:ring-2 focus:ring-[#7BAA5E]"
              />
            </div>

            {/* Password Input and Forgot Link */}
            <div className="flex w-full flex-col items-end gap-1">
              <div className="relative w-full">
                <img
                  src="/images/lock.svg"
                  alt="Ícone de cadeado"
                  className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 transform w-[1.5rem] h-[1.5rem]"
                />
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Senha"
                  className="h-[3.25rem] w-full rounded-[1.25rem] border border-[#E0E0D6] bg-[#FFFDF7] pl-12 pr-5 text-base text-[#A57955] placeholder:text-[#A57955] focus:outline-none focus:ring-2 focus:ring-[#7BAA5E]"
                />
              </div>
              <a href="/esqueci-minha-senha" className="text-sm font-medium text-[#BB9A7F] hover:underline">
                Esqueci minha senha...
              </a>
            </div>

            {/* Access Button */}
            <button
              type="submit"
              className="mt-2 flex h-[3.25rem] w-full items-center justify-center rounded-[1.25rem] border border-[#4D6F39] bg-[#7BAA5E] text-base font-medium text-gray-50 shadow-md transition-colors hover:bg-[#6b9951]"
            >
              Acessar
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
              <img src="/logos/google-logo.png" alt="Google Logo" width={26} height={26} />
              <span>Fazer login com Google</span>
            </button>

            {/* Apple Login */}
            <button
              type="button"
              className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-[1.25rem] border border-[#313131] bg-gray-50 text-base font-medium text-[#494949] shadow-md transition-colors hover:bg-gray-200"
            >
              <img src="/logos/apple-logo.png" alt="Apple Logo" width={24} height={24} />
              <span>Fazer login com Apple</span>
            </button>

            {/* Sign-up Link */}
            <div className="mt-4 flex flex-row items-baseline gap-2">
              <span className="text-base text-[#BB9A7F]">
                Não tem uma conta?
              </span>
              <a href="/register" className="text-base font-semibold text-[#7BAA5E] hover:underline">
                Inscreva-se
              </a>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

