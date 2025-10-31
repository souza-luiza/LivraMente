import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

async function getAuthToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function PATCH(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const { opcao, qtd } = await request.json()

    const response = await fetch(`${API_BASE_URL}/users/me/registro-leitura`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
