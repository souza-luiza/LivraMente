# Estrutura de URLs das Readlists

## Nova Estrutura de Rotas

### Visualizar Readlist
`/{username}/readlist/{readlistSlug}`

**Exemplos:**
- `dave/readlist/official-top-250-narrative-feature-books`
- `gatanoturna/readlist/livros-2025`
- `maria/readlist/meus-livros-favoritos`

### Editar Readlist (apenas para donos)
`/{username}/readlist/{readlistSlug}/edit`

**Exemplos:**
- `dave/readlist/official-top-250-narrative-feature-books/edit`
- `gatanoturna/readlist/livros-2025/edit`

## Proteções Implementadas

1. **Página de Visualização (`page.tsx`)**
   - Acessível para todos os usuários
   - Mostra botão de edição apenas para o dono

2. **Página de Edição (`edit/page.tsx`)**
   - Verifica se o usuário atual é o dono
   - Redireciona automaticamente para a página de visualização se não for o dono
   - Não renderiza conteúdo para usuários não autorizados

## TODOs

- [ ] Implementar verificação real de autenticação
- [ ] Conectar com API para buscar dados da readlist
- [ ] Implementar salvamento de alterações
- [ ] Adicionar tratamento de erros (readlist não encontrada)
- [ ] Adicionar loading states

## Estrutura de Arquivos

```
src/app/
└── [username]/
    └── readlist/
        └── [readlistSlug]/
            ├── page.tsx          # Visualização da readlist
            └── edit/
                └── page.tsx      # Edição da readlist
```
