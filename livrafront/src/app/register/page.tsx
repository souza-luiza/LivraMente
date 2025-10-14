'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/button'
import Input from '@/components/general-input'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import LogoIcon from '@/components/icons/LogoIcon'
import OpenBookIcon from '@/components/icons/OpenBookIcon'
import CommunityIcon from '@/components/icons/CommunityIcon'
import LibraryIcon from '@/components/icons/LibraryIcon'
import StarIcon from '@/components/icons/StarIcon'
import DateInput from '@/components/date-input'
import CountrySelect from '@/components/select-country'
import { motion, AnimatePresence } from 'framer-motion'
import PasswordStrength from '@/components/password-strength'
import PhoneInputComponent from '@/components/phone-input'
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import ToastNotification from '@/components/toast-notification'
import { toast } from 'react-toastify'
import FolderIcon from '@/components/icons/FolderIcon'
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon'

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
        const isValid = isValidPhoneNumber(formData.phone, formData.country as CountryCode)
        
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
              Livramente
            </h1>
            <p className="text-gray-600">
              A rede social dos leitores brasileiros
            </p>
          </div>

          {/* Formulário */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-2">
              <h2 className="text-b1 body-semibold text-center text-gray-900">
                Cadastre-se!
              </h2>
              <p className="text-b3 text-center text-gray-600 mt-1">
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
                    placeholder="gatanoturna"
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
                    fullWidth
                  />

                  <div className="text-b3 text-[#1F2A17]">
                    <PasswordStrength password={formData.password} />
                  </div>

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
                  <div className="flex justify-center mt-1">
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
                  className="space-y-2 max-h-[400px] items-center flex flex-col justify-center">
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
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div>
                      <Button
                        type="button"
                        text="Voltar"
                        icon={<ArrowLeftIcon />}
                        size="medium"
                        colorScheme="light-green"
                        onClick={handlePreviousStep}
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        text="Finalizar Cadastro"
                        size="medium"
                        colorScheme="dark-green"
                        loading={false}
                        icon={<FolderIcon />}
                      />
                    </div>
                  </div>
                </motion.form>
              )}
              </AnimatePresence>

              {/* Link para Login */}
              <div className="text-b3 text-center mt-2">
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
      <ToastNotification />
    </main>
  )
}