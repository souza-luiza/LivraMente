import { useState } from 'react'
import { loginSchema } from '@/lib/validations/auth'
import { loginUser } from '@/services/auth'

export function useLoginForm() {
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

    // Adiciona ou remove erro conforme mudanças no input
    try {
      loginSchema.shape[name as keyof typeof loginSchema.shape].parse(value)
      setErrors(prev => ({ ...prev, [name]: undefined })) 
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || 'Campo inválido'
      setErrors(prev => ({ ...prev, [name]: message }))
    }
  }

  // Envia dados para API e trata respostas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')

    try {
      loginSchema.parse(formData)
      const response = await loginUser(formData)

      alert(`Bem-vindo ${response.user.username}`)
      console.log('Token recebido:', response.token)
      
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: any = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setApiError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    formData, errors, handleChange, handleSubmit, isLoading, apiError
  }
}