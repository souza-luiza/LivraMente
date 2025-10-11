'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/button'
import Input from '@/components/general-input'
import Image from 'next/image'
import DateInput from '@/components/date-input'
import CountrySelect from '@/components/select-country'
import { motion, AnimatePresence } from 'framer-motion'
import PasswordStrength from '@/components/password-strength'
import PhoneInputComponent from '@/components/phone-input'
import { isValidPhoneNumber } from 'libphonenumber-js'
import ToastNotification from '@/components/toast-notification'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    country: '',
    phone: ''
  })
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    country: '',
    phone: ''
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

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      country: value
    }))
    
    if (errors.country) {
      setErrors(prev => ({
        ...prev,
        country: ''
      }))
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
    
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      country: '',
      phone: ''
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
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword
  }

  const validateStep2 = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      country: '',
      phone: ''
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age < 13) {
        newErrors.birthDate = 'Você deve ter pelo menos 13 anos'
      }
    }

    if (!formData.country.trim()) {
      newErrors.country = 'País é obrigatório'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else {
      try {
        // Tenta validar o telefone com o código do país usando o libphonenumber-js
        const isValid = isValidPhoneNumber(formData.phone, formData.country as any)
        
        if (!isValid) {
          newErrors.phone = 'Número de telefone inválido para o país selecionado'
        }
      } catch (error) {
        newErrors.phone = 'Formato de telefone inválido'
      }
    }

    setErrors(newErrors)
    return !newErrors.birthDate && !newErrors.country && !newErrors.phone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateStep1()) {
      setDirection('forward')
      setStep(2)
    }
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setDirection('forward')
      setStep(2)
    }
  }

  const handlePreviousStep = () => {
    setDirection('backward')
    setStep(1)
  }

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -20 : 20,
      opacity: 0
    })
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // redirecionamento para página de sucesso
        router.push('/register/success')
      } else if (response.status === 400) {
        const data = await response.json()
        const msg = data.message || 'Dados inválidos'

        setErrors(prev => ({
          ...prev,
          email: msg.includes('Email') ? msg : prev.email,
          name: msg.includes('usuário') ? msg : prev.name,
        }));
        toast.error(msg);
      } else {
        toast.error('Erro inesperado. Tente novamente mais tarde.')
      }
    } catch (error) {
      toast.error('Falha ao conectar com o servidor.')
    }
  }

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

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
              <div className="w-12 h-12 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white/90"><Image src="/images/Open_Book_White.svg" alt="Ícone de Livro" width={24} height={24} /></span> {/*TODO: Definir biblioteca de ícones*/}
              </div>
              <div>
                <h3 className="font-semibold text-lg">Acompanhar a sua leitura</h3>
                <p className="opacity-80">Registre seu progresso e metas</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white/90"><Image src="/images/Users_White.svg" alt="Ícone de Usuários" width={24} height={24} /></span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Conecte-se e interaja</h3>
                <p className="opacity-80">Encontre amigos e comunidades literárias</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white/90"><Image src="/images/Books_White.svg" alt="Ícone de Livros" width={24} height={24} /></span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Avalie livros e receba recomendações</h3>
                <p className="opacity-80">Compartilhe suas opiniões e descubra novas leituras</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white/90"><Image src="/images/Star_White.svg" alt="Ícone de Estrela" width={24} height={24} /></span>
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
              Livramente
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
                {step === 1 ? 'Junte-se à nossa comunidade de leitores' : 'Informações adicionais'}
              </p>
              <div className="flex justify-center mt-4 space-x-2">
                <motion.div 
                  onClick={() => { handlePreviousStep() }} 
                  className={`h-2 rounded-full ${step === 1 ? 'bg-green-700' : 'bg-gray-300'}`} 
                  style={{ cursor: 'pointer' }}
                  animate={{
                    width: step === 1 ? 20 : 12,
                    backgroundColor: step === 1 ? '#2F855A' : '#D1D5DB'
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}  
                >
                </motion.div>
                <motion.div 
                  onClick={() => { handleNextStep() }} 
                  className={`h-2 rounded-full ${step === 2 ? 'bg-green-700' : 'bg-gray-300'}`} 
                  style={{ cursor: 'pointer' }}
                  animate={{
                    width: step === 2 ? 20 : 12,
                    backgroundColor: step === 2 ? '#2F855A' : '#D1D5DB'
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}  
                >  
                </motion.div>
              </div>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {/* Etapa 1 */}
              {step === 1 && (
                <motion.form 
                  key="step1" 
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit} 
                  className="space-y-2 min-h-[400px] flex flex-col justify-center">
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
                    // helperText="Use pelo menos 6 caracteres com letras e números"
                    fullWidth
                  />
                  <PasswordStrength password={formData.password} />

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
                  />

                  {/* Botão de Submit */}
                  <div className="flex justify-center mt-4">
                    <Button
                      type="submit"
                      text={false ? 'Carregando...' : 'Próximo Passo'}
                      icon={<Image src="/icons/chevronLeft.svg" alt="Seta para Direita" className='transform rotate-180' width={16} height={16} />}
                      size="small"
                      colorScheme="dark-green"
                      loading={false}
                    >
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Etapa 2 */}
              {step === 2 && (
                <motion.form 
                  key="step2" 
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  onSubmit={handleOnSubmit} 
                  className="space-y-2 min-h-[400px] items-center flex flex-col justify-center">
                  {/* Data de Nascimento */}
                  <DateInput
                    label="Data de Nascimento"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    error={errors.birthDate}
                    max={new Date().toISOString().split('T')[0]}
                    fullWidth
                  />

                  {/* País */}
                  <CountrySelect
                    label="País"
                    required
                    value={formData.country}
                    onChange={handleCountryChange}
                    error={errors.country}
                    fullWidth
                  />

                  {/* Telefone */}
                  <PhoneInputComponent
                    label="Telefone"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    error={errors.phone}
                    fullWidth
                  />

                  {/* Botões Voltar e Submit */}
                  <div className="flex justify-between mt-6 w-full">
                    <Button
                      type="button"
                      text="Voltar"
                      icon={<Image src="/icons/chevronLeft_darkGreen.svg" alt="Seta para Esquerda" width={16} height={16} />}
                      size="small"
                      colorScheme="light-green"
                      onClick={handlePreviousStep}
                    />
                    <Button
                      type="submit"
                      text="Finalizar Cadastro"
                      size="small"
                      colorScheme="dark-green"
                      loading={false}
                      icon={<Image src="/icons/register.svg" alt="Ícone de Cadastro" width={16} height={16} />}
                    />
                  </div>
                </motion.form>
              )}
              </AnimatePresence>

              {/* Link para Login */}
              <div className="mt-2 text-center">
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
      <ToastNotification />
    </div>
  )
}