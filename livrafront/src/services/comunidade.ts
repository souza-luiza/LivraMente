const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

function getAuthHeaders(): { [key: string]: string } | undefined {
  if (typeof window === 'undefined') return undefined
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

export async function createCommunity(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/comunidades`, {
    method: 'POST',
    headers: {
      ...(getAuthHeaders() || {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao criar comunidade')
    return Promise.reject(new Error(text || 'Erro ao criar comunidade'))
  }

  return response.json()
}

export async function getCommunity(comunidadeNome: string) {
  const response = await fetch(`${API_BASE_URL}/comunidades/${comunidadeNome}`, {
    headers: {
      ...(getAuthHeaders() || {}),
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao buscar comunidade')
    return Promise.reject(new Error(text || 'Erro ao buscar comunidade'))
  }
  return response.json()
}

export async function updateCommunity(comunidadeNome: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/comunidades/${comunidadeNome}`, {
    method: 'PATCH',
    headers: {
      ...(getAuthHeaders() || {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erro ao editar comunidade')
    return Promise.reject(new Error(text || 'Erro ao editar comunidade'))
  }

  return response.json()
}