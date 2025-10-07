import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()


    // Sucesso
    return NextResponse.json({
      ok: true,
      message: 'Usuário registrado com sucesso!',
    })
  } catch (err) {
    console.error('Erro no mock /api/register:', err)
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
