'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CalendarIcon from './icons/CalendarIcon'
import Input from './general-input'
import Button from './button'
import AddIcon from './icons/AddIcon'

interface RegistroLeituraProps {
    isLoggedIn: boolean
}

export default function RegistroLeitura({ isLoggedIn }: RegistroLeituraProps) {
    const [step, setStep] = useState(1)

    const [show, setShow] = useState(true)

    // Verifica se o usuário está logado e se já registrou a leitura hoje
    useEffect(() => {
        if (!isLoggedIn) return

        const today = new Date().toDateString()

        // Rever isso! Talvez registrar último acesso no banco?
        const lastAccess = localStorage.getItem('lastAccess')

        if (lastAccess !== today) {
        setShow(true)
        localStorage.setItem('lastAccess', today)
        }
    }, [isLoggedIn])

    if (!show) return null

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
        ...prev,
        [name]: value
        }))
        
        if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }))
        }
    }

    // Limite diário de XP por registro de leitura
    const XP_LIMIT = 60;

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        try {

            // Cálculo de XP baseado em páginas ou minutos lidos
            let xp = formData.pagesRead ? parseInt(formData.pagesRead) : parseInt(formData.minutesRead) / 2

            if (xp > XP_LIMIT) {
                xp = XP_LIMIT;
            }

            // Atualizar XP no banco

            // Se der tudo certo, estado sucesso

        } catch (error) {
            console.error('Falha ao conectar com o servidor.')
        }
    }

    const handleStepChange = () => {
        formData.minutesRead = ''
        formData.pagesRead = ''
        setStep(prev => (prev === 1 ? 2 : 1))
    }

    return (
        <AnimatePresence>
            {show &&
            <motion.div 
                key="registro-leitura"
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
                                    type="number"
                                    value={formData.pagesRead}
                                    onChange={handleInputChange}
                                    error={errors.pagesRead}
                                    placeholder="Exemplo: 74"
                                    required
                                    fullWidth
                                />
                                <Input 
                                    label="Quantidade de Livros Lidos" 
                                    name="bookAmount"
                                    type="number"
                                    value={formData.bookAmount}
                                    onChange={handleInputChange}
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
                                    type="number"
                                    value={formData.minutesRead}
                                    onChange={handleInputChange}
                                    error={errors.minutesRead}
                                    placeholder="Exemplo: 30"
                                    required
                                    fullWidth
                                />
                                <Input 
                                    label="Quantidade de Livros Lidos" 
                                    name="bookAmount"
                                    type="number"
                                    value={formData.bookAmount}
                                    onChange={handleInputChange}
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
        </AnimatePresence>
    )
}