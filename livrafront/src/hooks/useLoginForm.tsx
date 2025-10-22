'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' 
import { ZodError } from 'zod'
import { loginSchema } from '@/lib/validations/auth'
import { loginUser } from '@/services/auth'

export function useLoginForm() {
  const router = useRouter() 
  
  // Dados do formulário e mensagens de erro
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})
  // Estado de carregamento e erro da API
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  // Atualiza campos e valida com a biblioteca Zod
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Validar campo específico
    try {
      if (name === 'email') {
        loginSchema.shape.email.parse(value)
      } else if (name === 'password') {
        loginSchema.shape.password.parse(value)
      }
      
      // Se passou na validação, remove o erro
      setErrors(prev => ({ ...prev, [name]: undefined }))
      
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || 'Campo inválido'
        setErrors(prev => ({ ...prev, [name]: message }))
      }
    }
  }

  // Envia dados para API e trata respostas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')

    try {
      // Validar todos os campos antes do submit
      loginSchema.parse(formData)
      
      // Se passou na validação, fazer o login
      const response = await loginUser(formData)

      // Salvar dados no localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      try {
        const user: any = response.user || {};
        if (user.username) localStorage.setItem('username', String(user.username));
        const id = user._id ?? user.id ?? user.userId ?? '';
        if (id) localStorage.setItem('userId', String(id));
      } catch (e) {
      }
      
      router.push(`${response.user.username}`)
      
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: {email?: string, password?: string} = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0] as 'email' | 'password'
          fieldErrors[field] = issue.message
        })
        setErrors(fieldErrors)
      } else {
        setApiError((error as Error).message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    formData, errors, handleChange, handleSubmit, isLoading, apiError
  }
}