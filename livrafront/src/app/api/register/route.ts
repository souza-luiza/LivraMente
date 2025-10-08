import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const backendResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.name,
        email: data.email,
        senha: data.password,
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          ok: false,
          message: errorData.message || 'Erro ao registrar usuário no backend.',
        },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()

    return NextResponse.json({
      ok: true,
      message: 'Usuário registrado com sucesso.',
      data: result,
    })
  } catch (err) {
    console.error('Erro ao registrar usuário:', err)
    return NextResponse.json(
      { ok: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
