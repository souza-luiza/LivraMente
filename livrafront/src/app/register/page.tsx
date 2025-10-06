'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/button'
import Input from '@/components/input'
import Image from 'next/image'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'

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
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Verde */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={{ backgroundColor: '#5C8046' }}>
        <div className="flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo/Marca */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4">
              Livramente
            </h1>
            <p className="text-xl opacity-90 mb-8">
              A rede social dos leitores brasileiros
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-6 max-w-md">
            <div className="flex justify-center items-center space-x-4">
              <div>
                <h3 className="font-semibold text-lg text-center">Aqui você pode:</h3>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📖</span> {/*TODO: Definir biblioteca de ícones*/}
              </div>
              <div>
                <h3 className="font-semibold text-lg">Acompanhe sua leitura</h3>
                <p className="opacity-80">Registre seu progresso e metas</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Conecte-se e interaja</h3>
                <p className="opacity-80">Encontre amigos e comunidades literárias</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Avalie livros e receba recomendações</h3>
                <p className="opacity-80">Compartilhe suas opiniões e descubra novas leituras</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ganhe XP e participe de competições</h3>
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
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <Image 
                  src="/logo-vetorizada.svg" 
                  alt="Livramente Logo" 
                  width={80} 
                  height={80}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Cadastre-se!
              </h2>
              <p className="text-gray-600 text-center mt-2">
                Junte-se à nossa comunidade de leitores
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <Input
                label="Nome de Usuário"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Seu nome de usuário"
                fullWidth
                className="focus:ring-green-700 focus:border-green-700"
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
                placeholder="seu@email.com"
                fullWidth
                className="focus:ring-green-700 focus:border-green-700"
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
                placeholder="Mínimo 6 caracteres"
                helperText="Use pelo menos 6 caracteres com letras e números"
                fullWidth
                className="focus:ring-green-700 focus:border-green-700"
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
                placeholder="Confirme sua senha"
                fullWidth
                className="focus:ring-green-700 focus:border-green-700"
              />

              {/* Botão de Submit */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  text={false ? 'Carregando...' : 'Próximo Passo'}
                  icon={<ArrowRightIcon />}
                  size="small"
                  colorScheme="dark-green"
                  loading={false}
                >
                </Button>
              </div>
            </form>

            {/* Link para Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já possui uma conta?{' '}
                <Link 
                  href="/login" 
                  className="text-green-700 hover:text-green-700 font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="/terms" className="text-green-600 hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}