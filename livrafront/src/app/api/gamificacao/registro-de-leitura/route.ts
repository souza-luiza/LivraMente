import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export async function PATCH(request: Request) {
  try {

    const { opcao, qtd } = await request.json()

    const response = await fetch(`${API_BASE_URL}/users/me/registro-leitura`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        credentials: "include",
      },
      body: JSON.stringify({ opcao, qtd }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Erro ao registrar leitura: ${text}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Erro ao registrar leitura:', error)
    return NextResponse.json({ error: 'Erro ao registrar leitura' }, { status: 500 })
  }
}
