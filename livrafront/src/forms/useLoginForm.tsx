import { useState } from 'react'
import { loginSchema } from '@/lib/validations/auth'
import { loginUser } from '@/services/auth'
import { ZodError } from 'zod'

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
      alert(`Bem-vindo ${response.user.username}`)
      console.log('Token recebido:', response.token)
      
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: any = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string
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