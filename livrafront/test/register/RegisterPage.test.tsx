import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/register/page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }))

describe('RegisterPage', () => {
  const pushMock = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('mostra alerta se falhar conexão', async () => {
    // mock: fetch rejeita (erro de rede)
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    // mock do alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<RegisterPage />)

    await userEvent.type(screen.getByPlaceholderText('Seu nome de usuário'), 'loren')
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'loren@teste.com')
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456')
    await userEvent.type(screen.getByPlaceholderText('Confirme sua senha'), '123456')

    await userEvent.click(screen.getByRole('button', { name: /Próximo Passo/i }))

    // espera o alert do catch
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Falha ao conectar com o servidor.')
    )

    alertSpy.mockRestore()
  })

  it('mostra alerta em caso de erro inesperado (500)', async () => {
    // mock: fetch retorna 500
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Erro interno no servidor.' }),
    })

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<RegisterPage />)

    // preenche o formulário com valores válidos
    await userEvent.type(screen.getByPlaceholderText('Seu nome de usuário'), 'loren')
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'loren@test.com')
    await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456')
    await userEvent.type(screen.getByPlaceholderText('Confirme sua senha'), '123456')

    await userEvent.click(screen.getByRole('button', { name: /Próximo Passo/i }))

    // espera o alert do status 500
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Erro inesperado. Tente novamente mais tarde.')
    )

    alertSpy.mockRestore()
  })
})
