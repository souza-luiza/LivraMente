# 📚 Seed de Livros - Instruções

## Como popular o banco de dados com livros

### 1️⃣ Execute o script de seed:

**No terminal bash:**
```bash
cd D:/Projetos/Repositorios/es-unifesp-2025-2-grupo-alpha/livraback
npm run seed:livros
```

**No CMD:**
```cmd
cd D:\Projetos\Repositorios\es-unifesp-2025-2-grupo-alpha\livraback
npm run seed:livros
```

### 2️⃣ O que o script faz:

- 🔍 Busca livros na **Google Books API**
- 📖 Obtém dados em **português**
- 👤 Cria automaticamente os **autores**
- 💾 Salva no **MongoDB**
- ⏭️ Pula livros que já existem (baseado no ISBN)

### 3️⃣ Livros incluídos:

O script busca **~23 livros populares**:
- Harry Potter (série)
- O Senhor dos Anéis
- Jogos Vorazes
- Percy Jackson
- A Culpa é das Estrelas
- Clássicos brasileiros (Machado de Assis, Jorge Amado, etc.)
- E mais...

### 4️⃣ Dados obtidos:

Para cada livro:
- ✅ Título (em português)
- ✅ Autores
- ✅ ISBN
- ✅ Sinopse/Descrição
- ✅ Editora
- ✅ Ano de publicação
- ✅ Número de páginas
- ✅ Gêneros/Categorias
- ✅ URL da capa

### 5️⃣ Personalizar:

Para adicionar mais livros, edite o arquivo:
```
src/seed-livros.ts
```

E adicione títulos no array `LIVROS_POPULARES`:
```typescript
const LIVROS_POPULARES = [
  'Seu livro aqui',
  'Outro livro',
  // ...
];
```

### 6️⃣ Verificar no MongoDB Compass:

Após executar, abra o Compass e veja:
- Collection `livros` com os livros criados
- Collection `autors` com os autores

### ⚠️ Observações:

- **API Key**: NÃO é obrigatória! Funciona sem.
- **Limite SEM API key**: 1000 requests/dia (mais que suficiente)
- **Limite COM API key**: 10.000 requests/dia
- **Delay**: Script tem delay de 500ms entre requests
- **Duplicados**: Não cria livros com ISBN duplicado
- **Dados em português**: Usa `langRestrict=pt` na busca

### 🔑 API Key (OPCIONAL):

Se quiser usar uma API key para ter mais limite:

1. Acesse: https://console.cloud.google.com
2. Crie um projeto
3. Ative a **Google Books API**
4. Crie uma **Chave de API**
5. Adicione no `.env`:
```env
GOOGLE_BOOKS_API_KEY=sua_chave_aqui
```

O script detecta automaticamente e usa a chave se disponível!

### 🆘 Troubleshooting:

**Se não encontrar um livro:**
- Ajuste o nome na busca (ex: adicionar autor)
- Exemplo: `'1984 George Orwell'` ao invés de só `'1984'`

**Se der erro de conexão:**
- Verifique o `.env` com a `DB_URL`
- Certifique-se que o MongoDB está acessível