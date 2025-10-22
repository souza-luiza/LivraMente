# Integração com API - Readlists

Este documento explica como usar os serviços de integração com a API de readlists.

## Estrutura Criada

### 1. Types (`src/types/readlist.ts`)
Define todas as interfaces TypeScript para trabalhar com readlists:
- `Readlist` - Estrutura completa de uma readlist
- `CreateReadlistData` - Dados para criar uma readlist
- `UpdateReadlistData` - Dados para atualizar uma readlist
- `ReadlistDetailResponse` - Resposta com livros populados
- `Book` - Estrutura de um livro

### 2. Services (`src/services/readlist.ts`)
Funções para comunicação com a API:

#### Buscar Readlists
```typescript
// Buscar todas as readlists do usuário autenticado
const readlists = await getUserReadlists()

// Buscar readlists públicas de um usuário específico
const publicReadlists = await getPublicReadlists('username')

// Buscar detalhes de uma readlist específica (com livros populados)
const readlist = await getReadlistById('readlist-id')
```

#### Criar Readlist
```typescript
const newReadlist = await createReadlist({
  nome: 'Minha Readlist',
  descricao: 'Descrição opcional',
  publica: true,
  favorito: false,
  capa_url: 'https://...'
})
```

#### Atualizar Readlist
```typescript
const updated = await updateReadlist('readlist-id', {
  nome: 'Novo Nome',
  descricao: 'Nova descrição',
  publica: false
})
```

#### Deletar Readlist
```typescript
await deleteReadlist('readlist-id')
```

#### Gerenciar Livros
```typescript
// Adicionar livro
const updated = await addBookToReadlist('readlist-id', 'livro-id')

// Remover livro
const updated = await removeBookFromReadlist('readlist-id', 'livro-id')
```

## Exemplo de Uso em Componentes

### 1. Buscar e Exibir Readlists do Usuário

```tsx
'use client'

import { useState, useEffect } from 'react'
import { getUserReadlists } from '@/services/readlist'
import { Readlist } from '@/types/readlist'

export default function UserReadlistsPage() {
  const [readlists, setReadlists] = useState<Readlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function loadReadlists() {
      try {
        const data = await getUserReadlists()
        setReadlists(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadReadlists()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {readlists.map(readlist => (
        <div key={readlist._id}>
          <h3>{readlist.nome}</h3>
          <p>{readlist.descricao}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Criar Nova Readlist

```tsx
'use client'

import { useState } from 'react'
import { createReadlist } from '@/services/readlist'
import { CreateReadlistData } from '@/types/readlist'

export default function CreateReadlistForm() {
  const [formData, setFormData] = useState<CreateReadlistData>({
    nome: '',
    descricao: '',
    publica: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const newReadlist = await createReadlist(formData)
      console.log('Readlist criada:', newReadlist)
      // Redirecionar ou mostrar mensagem de sucesso
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome da readlist"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
      />
      <textarea
        placeholder="Descrição"
        value={formData.descricao}
        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={formData.publica}
          onChange={(e) => setFormData({ ...formData, publica: e.target.checked })}
        />
        Pública
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Readlist'}
      </button>
      {error && <div>{error}</div>}
    </form>
  )
}
```

### 3. Buscar Dados de uma Readlist Específica

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getReadlistById } from '@/services/readlist'
import { ReadlistDetailResponse } from '@/types/readlist'

export default function ReadlistDetailPage() {
  const params = useParams()
  const readlistId = params.id as string

  const [readlist, setReadlist] = useState<ReadlistDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function loadReadlist() {
      try {
        const data = await getReadlistById(readlistId)
        setReadlist(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadReadlist()
  }, [readlistId])

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  if (!readlist) return <div>Readlist não encontrada</div>

  return (
    <div>
      <h1>{readlist.nome}</h1>
      <p>{readlist.descricao}</p>
      <div>
        {readlist.livros.map(livro => (
          <div key={livro.id}>
            <h3>{livro.title}</h3>
            <img src={livro.cover} alt={livro.title} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Tratamento de Erros

Todos os serviços lançam erros específicos que devem ser tratados:
- `'Usuário não autenticado'` - Token não encontrado no localStorage
- `'Sessão expirada. Faça login novamente.'` - Token inválido (401)
- `'Readlist não encontrada'` - ID inválido (404)
- `'Dados inválidos'` - Validação falhou (400)
- `'Erro interno do servidor'` - Erro no backend (500)

## Mapeamento API Backend

Os endpoints do backend seguem esta estrutura:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/readlists` | Lista readlists do usuário |
| POST | `/readlists` | Cria nova readlist |
| GET | `/readlists/:id` | Busca readlist por ID |
| PATCH | `/readlists/:id` | Atualiza readlist |
| DELETE | `/readlists/:id` | Deleta readlist |
| GET | `/readlists/public/:username` | Lista readlists públicas |
| PATCH | `/readlists/:id/livros/:livroId` | Adiciona livro |
| DELETE | `/readlists/:id/livros/:livroId` | Remove livro |

## Campos do Backend vs Frontend

### Backend (DTO)
```typescript
{
  nome: string
  favorito?: boolean
  publica?: boolean
  descricao?: string
  capa_url?: string
}
```

### Frontend (Atual)
```typescript
{
  title: string
  description: string
  coverImage: string
  isPrivate: boolean
}
```

**Nota**: Você precisará fazer um mapeamento entre os campos do frontend e backend. Por exemplo:
- `title` → `nome`
- `description` → `descricao`
- `coverImage` → `capa_url`
- `isPrivate` → `publica: !isPrivate`

## Próximos Passos

1. ✅ Criar types e services (concluído)
2. 🔄 Atualizar `EditReadlistModal` para usar `updateReadlist`
3. 🔄 Atualizar página `[readlistSlug]/page.tsx` para usar `getReadlistById`
4. 🔄 Criar hook customizado (opcional) para gerenciar estado das readlists
5. 🔄 Adicionar feedback visual (toasts) para sucesso/erro

Precisa de ajuda para implementar algum desses próximos passos?
