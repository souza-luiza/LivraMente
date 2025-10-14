'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/button'
import Input from '@/components/general-input'
import Image from 'next/image'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import LogoIcon from '@/components/icons/LogoIcon'
import OpenBookIcon from '@/components/icons/OpenBookIcon'
import CommunityIcon from '@/components/icons/CommunityIcon'
import LibraryIcon from '@/components/icons/LibraryIcon'
import StarIcon from '@/components/icons/StarIcon'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // TODO: Implementar lógica de registro
      console.log('Dados de registro:', formData)
    }
  }

  return (
    <main role="main" className="min-h-screen flex">
      {/* Lado Esquerdo - Verde */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={{ backgroundColor: 'var(--primary-600)' }}>
        <div className="flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo/Marca */}
          <div className="flex flex-col items-center text-[#E5EEDF] text-center mb-8">
            <LogoIcon size={160} fill="#E5EEDF" className="mb-2" />
            <h1 className="text-h1">
              LivraMente
            </h1>
            <p className="text-b1 body-semibold">
              A rede dos leitores brasileiros
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-4 w-fit text-[#E5EEDF]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <OpenBookIcon size={24} fill="#E5EEDF" />
              </div>
              <div className="text-b2">
                <h3 className="body-semibold">Acompanhe sua leitura</h3>
                <p className="opacity-80">Registre seu progresso e metas</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CommunityIcon size={24} fill="#E5EEDF" />
              </div>
              <div className="text-b2">
                <h3 className="body-semibold">Conecte-se e interaja</h3>
                <p className="opacity-80">Encontre amigos e comunidades literárias</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <LibraryIcon size={24} fill="#E5EEDF" />
              </div>
              <div className="text-b2">
                <h3 className="body-semibold">Avalie livros e receba recomendações</h3>
                <p className="opacity-80">Compartilhe suas opiniões e descubra novas leituras</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <StarIcon size={24} fill="#E5EEDF" />
              </div>
              <div className="text-b2">
                <h3 className="body-semibold">Ganhe XP e participe de competições</h3>
                <p className="opacity-80">Desafie seus amigos e suba de nível</p>
              </div>
            </div>
          </div>

          {/* TODO: Colocar um gato ou algo do tipo aqui */}
          {/* Decoração */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile */}
          <div className="text-center lg:hidden">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 Livramente
            </h1>
            <p className="text-gray-600">
              A rede social dos leitores brasileiros
            </p>
          </div>

          {/* Formulário */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-6">
              <h2 className="text-b1 body-semibold text-center text-gray-900">
                Cadastre-se!
              </h2>
              <p className="text-b3 text-center text-gray-600 mt-1">
                Junte-se à nossa comunidade de leitores
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Nome */}
              <Input
                label="Nome de Usuário"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="@gatanoturna"
                fullWidth
              />

              {/* Email */}
              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="kemi@gata.miau"
                fullWidth
              />

              {/* Senha */}
              <Input
                label="Senha"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="⁕⁕⁕⁕⁕⁕⁕⁕⁕"
                helperText="Use pelo menos 6 caracteres com letras e números"
                fullWidth
              />

              {/* Confirmar Senha */}
              <Input
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="⁕⁕⁕⁕⁕⁕⁕⁕⁕"
                fullWidth
              />

              {/* Botão de Submit */}
              <div className="flex justify-center mt-4 mb-4">
                <Button
                  type="submit"
                  text={false ? 'Carregando...' : 'Próximo Passo'}
                  icon={<ArrowRightIcon />}
                  size="medium"
                  colorScheme="dark-green"
                  loading={false}
                >
                </Button>
              </div>
            </form>

            <div className="max-w-[300px] text-b3 text-center text-gray-600 mb-4">
                <p>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Link href="/terms" className="body-semibold text-[#3D552F] hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacy" className="body-semibold text-[#3D552F] hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
            </div>

            {/* Link para Login */}
            <div className="text-b3 text-center">
              <p className=" text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  href="/login" 
                  className="body-semibold text-[#3D552F] hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}