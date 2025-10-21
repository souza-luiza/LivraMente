/* Validação do formato dos dados de 
   criação de readlist enviados no formulário */
import { z } from 'zod'

export const createReadlistSchema = z.object({
  titulo: z
    .string()
    .min(1, '* Título é obrigatório'),
  
  descricao: z
    .string()
    .max(250, 'Descrição deve ter no máximo 250 caracteres')
    .optional(),

  publica: z.boolean()
})

export type CreateReadlistFormData = z.infer<typeof createReadlistSchema>