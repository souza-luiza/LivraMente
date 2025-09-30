import { useState } from 'react'
import { loginSchema } from '@/lib/validations/auth'

export function useLoginForm() {
  // Dados do formulário e mensagens de erro
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})

  // Atualiza campo e valida com a biblioteca Zod
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

  return { 
    formData, errors, handleChange 
  }
}