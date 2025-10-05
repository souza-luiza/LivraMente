/* Formulário de login*/
'use client'

import { useLoginForm } from './useLoginForm'
import { LoginInput } from '@/components/forms/loginInput'
import { ErrorMessage } from '@/components/forms/errorMessage'
import { SubmitButton } from '@/components/forms/submitButton'
import Link from 'next/link'
import styles from '../app/login/login.module.css' 

export default function LoginForm() {
  const { 
    formData, errors, isLoading, apiError, handleChange, handleSubmit 
  } = useLoginForm()

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      
      {/* Mensagem de erro da API */}
      <ErrorMessage message={apiError} />

      {/* Campo de email - USAR ESTILOS DA AKEMI */}
      <LoginInput
        id="email"
        name="email"
        type="email"
        placeholder="Email ou nome de usuário"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        className={styles.input}
        fieldClassName={styles.field}
      />

      {/* Campo de senha - USAR ESTILOS DA AKEMI */}
      <LoginInput
        id="password"
        name="password"
        type="password"
        placeholder="Senha"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        className={styles.input}
        fieldClassName={styles.field}
      />

      {/* Link esqueci senha */}
      <Link href="/esqueci-minha-senha" className={styles.forgot}>
        Esqueci minha senha
      </Link>

      {/* Botão submit*/}
      <SubmitButton 
        isLoading={isLoading}
        className={styles.button}
      >
        Acessar
      </SubmitButton>
    </form>
  )
}