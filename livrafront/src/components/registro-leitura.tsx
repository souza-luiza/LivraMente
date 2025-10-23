'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CalendarIcon from './icons/CalendarIcon'
import Input from './general-input'
import Button from './button'
import AddIcon from './icons/AddIcon'
import LogoIcon from './icons/LogoIcon'
import RemoveIcon from './icons/RemoveIcon'
import ErrorIcon from './icons/ErrorIcon'

interface RegistroLeituraProps {
    isLoggedIn: boolean
}

export default function RegistroLeitura({ isLoggedIn }: RegistroLeituraProps) {
    const [step, setStep] = useState(1)
    const [show, setShow] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [xp, /*setXp*/] = useState(0)

    const [formData, setFormData] = useState({
        pagesRead: '',
        minutesRead: '',
        bookAmount: ''
    })

    const [errors, setErrors] = useState({
        pagesRead: '',
        minutesRead: '',
        bookAmount: ''
    })

    const formatter = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const hoje = formatter.format(new Date())

    const validateInput = (name: string, value: string): string => {
        const numericValue = value.replace(/[^\d]/g, '')
        
        const cleanValue = numericValue.replace(/^0+/, '')
        
        return cleanValue
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const cleanedValue = validateInput(name, value)
        
        setFormData(prev => ({
            ...prev,
            [name]: cleanedValue
        }))
        
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        
        if (value === '' && (name === 'pagesRead' || name === 'minutesRead')) {
            return
        }
        
        const cleanedValue = validateInput(name, value)
        setFormData(prev => ({
            ...prev,
            [name]: cleanedValue
        }))
    }

    // Verifica se o usuário está logado e se já registrou a leitura hoje
    useEffect(() => {
        if (!isLoggedIn) return

        const today = new Date().toDateString()
        const lastAccess = localStorage.getItem('lastAccess')

        if (lastAccess !== today) {
            setShow(true)
            localStorage.setItem('lastAccess', today)
        }
    }, [isLoggedIn])

    if (!show) return null

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // TODO: INTEGRAÇÃO COM A API
            // let xp = resposta da API
            // setXp(xp)
            setStatus('success')
        } catch (error) {
            console.error('Falha ao conectar com o servidor.')
            setStatus('error')
        }
    }

    const handleStepChange = () => {
        setFormData(prev => ({
            ...prev,
            minutesRead: '',
            pagesRead: ''
        }))
        setStep(prev => (prev === 1 ? 2 : 1))
    }

    return (
        <AnimatePresence>
            {show && status === 'idle' &&
            <motion.div 
                key="registro-leitura-idle"
                className="fixed inset-0 flex items-center justify-center bg-[#E5EEDF]/60 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >
                <div className="flex flex-col items-center light-green p-[20px] rounded-[12px] gap-2 w-[390px]">

                    {/* Cabeçalho */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex flex-row items-center gap-3">
                            <CalendarIcon size={24} fill="#1F2A17" />
                            <h1 className="text-h5">{hoje}</h1>
                            <CalendarIcon size={24} fill="#1F2A17" />
                        </div>
                        <p className="text-b2">Registre sua leitura de hoje!</p>
                    </div>

                    {/* Indicador de formulário */}
                    <div className="flex justify-center space-x-1">
                        <motion.div
                            onClick={() => { handleStepChange() }}
                            className="rounded-full cursor-pointer flex items-center justify-center"
                            animate={{
                                width: step === 1 ? 80 : 30,
                                height: 20,
                                backgroundColor: step === 1 ? '#3D552F' : '#E5EEDF',
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <span
                                className={`text-b3 body-semibold transition-opacity duration-200 ${
                                step === 1 ? 'opacity-100 text-[#E5EEDF]' : 'opacity-0'
                                }`}
                            >
                                Páginas
                            </span>
                        </motion.div>
                        <motion.div
                            onClick={() => { handleStepChange() }}
                            className="rounded-full cursor-pointer flex items-center justify-center"
                            animate={{
                                width: step === 2 ? 80 : 30,
                                height: 20,
                                backgroundColor: step === 2 ? '#3D552F' : '#E5EEDF',
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <span
                                className={`text-b3 body-semibold transition-opacity duration-200 ${
                                step === 2 ? 'opacity-100 text-[#E5EEDF]' : 'opacity-0'
                                }`}
                            >
                                Minutos
                            </span>
                        </motion.div>
                    </div>
                    
                    {/* Formulário de registro de leitura */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form 
                                className="flex flex-col items-center gap-1"
                                id="pagesForm"
                                onSubmit={handleOnSubmit}
                            >
                                <Input 
                                    label="Páginas Lidas" 
                                    name="pagesRead"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.pagesRead}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    error={errors.pagesRead}
                                    placeholder="Exemplo: 74"
                                    required
                                    fullWidth
                                />
                                <Input 
                                    label="Quantidade de Livros Lidos" 
                                    name="bookAmount"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.bookAmount}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    error={errors.bookAmount}
                                    placeholder="Exemplo: 2"
                                    fullWidth
                                />
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form 
                                className="flex flex-col items-center gap-1"
                                id="minutesForm"
                                onSubmit={handleOnSubmit}
                            >
                                <Input 
                                    label="Minutos Lidos" 
                                    name="minutesRead"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.minutesRead}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    error={errors.minutesRead}
                                    placeholder="Exemplo: 30"
                                    required
                                    fullWidth
                                />
                                <Input 
                                    label="Quantidade de Livros Lidos" 
                                    name="bookAmount"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.bookAmount}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    error={errors.bookAmount}
                                    placeholder="Exemplo: 2"
                                    fullWidth
                                />
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Botão para registrar leitura */}
                    <div className='flex flex-row mt-1 gap-1'>
                        <Button
                            text="Registrar"
                            icon={<AddIcon />}
                            size="medium"
                            colorScheme="dark-brown"
                            type="submit"
                            form={step == 1 ? "pagesForm" : "minutesForm"}
                        />
                    </div>
                </div>
            </motion.div>
            }

            {/* Success and Error states remain the same */}
            {show && status === 'success' &&
            <motion.div 
                key="registro-leitura-success"
                className="fixed inset-0 flex items-center justify-center bg-[#E5EEDF]/60 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >
                <div className="flex flex-col items-center light-green p-[20px] rounded-[12px] gap-2">
                    <div className="flex flex-col justify-center items-center text-[#1F2A17] gap-1">
                        <LogoIcon size={40} fill="#1F2A17" />
                        <h1 className="text-h5">Leitura registrada!</h1>
                    </div>
                    <div className="text-center">
                        <p className="text-h4 text-[#4B8511]">+{xp} XP</p>
                        <p className="text-b2 text-[#1F2A17]">Volte amanhã para registrar seu progresso!</p>
                    </div>
                    <Button
                        text="Fechar"
                        icon={<RemoveIcon />}
                        size="medium"
                        colorScheme="dark-brown"
                        onClick={() => setShow(false)}
                    />
                </div>
            </motion.div>
            }

            {show && status === 'error' &&
            <motion.div 
                key="registro-leitura-error"
                className="fixed inset-0 flex items-center justify-center bg-[#E5EEDF]/60 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >
                <div className="flex flex-col items-center light-green p-[20px] rounded-[12px] gap-4">
                    <div className="flex flex-col justify-center items-center text-[#1F2A17] gap-4">    
                        <ErrorIcon size={80} fill="#682A1B" />
                        <div className="text-center gap-1">
                            <h1 className="text-h5">Ocorreu um erro!</h1>
                            <p className="text-b2">Tente novamente mais tarde.</p>
                        </div>
                    </div>
                    <Button
                        text="Fechar"
                        icon={<RemoveIcon />}
                        size="medium"
                        colorScheme="dark-brown"
                        onClick={() => setShow(false)}
                    />
                </div>
            </motion.div>
            }
        </AnimatePresence>
    )
}