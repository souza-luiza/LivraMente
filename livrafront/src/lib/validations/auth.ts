/* Validação do formato dos dados de 
   login enviados no formulário */

import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Esse campo é obrigatório')
    .email('Email deve ter formato válido')
    .trim(),
    
  password: z
    .string()
    .min(1, 'Esse campo é obrigatório')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>