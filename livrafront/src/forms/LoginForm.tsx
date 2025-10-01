/* Componente de formulário de login refatorado*/
'use client'

import { useLoginForm } from './useLoginForm'
import { LoginInput } from '@/components/forms/loginInput'
import { ErrorMessage } from '@/components/forms/errorMessage'
import { SubmitButton } from '@/components/forms/submitButton'

export default function LoginForm() {
  const { 
    formData, errors, isLoading, apiError, handleChange, handleSubmit 
  } = useLoginForm()

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg 
                    transform transition-all duration-300 hover:shadow-xl
                    border border-green-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800
                     bg-gradient-to-r from-green-600 to-green-800 
                     bg-clip-text text-transparent font-poppins">
        Login
      </h2>
      
      {/* Mensagem de erro da API */}
      <ErrorMessage message={apiError} />

      <form onSubmit={handleSubmit}>
        {/* Campo de email */}
        <LoginInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        {/* Campo de senha */}
        <LoginInput
          id="password"
          name="password"
          type="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        {/* Botão de enviar */}
        <SubmitButton isLoading={isLoading}>
          Entrar
        </SubmitButton>
      </form>
    </div>
  )
}