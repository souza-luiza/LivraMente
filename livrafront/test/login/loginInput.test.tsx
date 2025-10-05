import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginInput } from '@/components/forms/loginInput'

describe('Componente loginInput', () => {
  it('deve renderizar input sem erro', () => {
    render(
      <LoginInput 
        name="email" 
        placeholder="Email" 
        value=""
        onChange={() => {}}
      />
    )
    
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveClass('border-gray-300')
  })

  it('deve renderizar input com erro', () => {
    render(
      <LoginInput 
        name="email" 
        placeholder="Email" 
        value=""
        onChange={() => {}}
        error="Email é obrigatório"
      />
    )
    
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveClass('border-red-500')
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
  })
})