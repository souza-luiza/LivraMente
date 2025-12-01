import { PATCH } from '@/app/api/gamificacao/registro-de-leitura/route'
import { NextResponse } from 'next/server'

// Mock global fetch e NextResponse
global.fetch = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}))

describe('PATCH /api/gamification/reading', () => {
  const API_BASE_URL = 'http://localhost:3001'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_BASE_URL = API_BASE_URL
  })

  const mockRequest = (options: {
    body?: any
  }): Request => {
    const headers = new Headers()
    const body = options.body ? JSON.stringify(options.body) : null
    return new Request('http://localhost/api/gamification/reading', {
      method: 'PATCH',
      headers,
      body,
    })
  }

  it('should call backend with correct payload and headers', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ganhoXP: 25 }),
    })

    const request = mockRequest({
      body: { opcao: 0, qtd: 25 },
    })

    const response = await PATCH(request)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/users/me/registro-leitura`,
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          credentials: "include",
        }),
        body: JSON.stringify({ opcao: 0, qtd: 25 }),
      })
    )

    expect(NextResponse.json).toHaveBeenCalledWith(
      { ganhoXP: 25 },
      { status: 200 }
    )
    expect(response.status).toBe(200)
  })

  it('should handle backend error response (response.ok = false)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Erro no servidor',
    })

    const request = mockRequest({
      body: { opcao: 1, qtd: 10 },
    })

    const response = await PATCH(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Erro ao registrar leitura' },
      { status: 500 }
    )
    expect(response.status).toBe(500)
  })

  it('should handle fetch throwing an exception', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Falha de rede')
    )

    const request = mockRequest({
      body: { opcao: 0, qtd: 15 },
    })

    const response = await PATCH(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Erro ao registrar leitura' },
      { status: 500 }
    )
    expect(response.status).toBe(500)
  })
})
