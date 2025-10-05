import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SubmitButton } from '@/components/forms/submitButton'

describe('Componente submitButton', () => {
  it('deve renderizar botão normal', () => {
    render(<SubmitButton>Enviar</SubmitButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Enviar')
    expect(button).not.toBeDisabled()
  })

  it('deve renderizar botão em estado de loading', () => {
    render(<SubmitButton isLoading={true}>Enviar</SubmitButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Carregando...')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-wait')
  })

  it('deve renderizar botão desabilitado', () => {
    render(<SubmitButton disabled={true}>Enviar</SubmitButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Enviar')
  })
})