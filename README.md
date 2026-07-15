# LivraMente - A rede social dos leitores brasileiros
<img width="1800" height="234" alt="banner-readme" src="https://github.com/user-attachments/assets/0167a5ad-2194-4ead-b57e-13cf8aaca00e" />

![Badge Inativo](http://img.shields.io/static/v1?label=Status&message=Inativo&color=blue)

> Uma rede social para leitores brasileiros, unindo descoberta de livros, comunidades, listas personalizadas e escrita colaborativa.

🌐 **Acesso em:** https://livramente.vercel.app/

## 📖 Sobre o Projeto
O LivraMente foi desenvolvido durante a disciplina de **Engenharia de Software**, ministrada no ICT-UNIFESP, de acordo com a metodologia ágil Scrum.

O objetivo do projeto foi criar uma plataforma onde leitores possam descobrir novos livros, compartilhar experiências de leitura e participar de comunidades temáticas, oferecendo uma experiência que vai além de um catálogo de livros tradicional.

## ✨ Principais funcionalidades
### 🔐 Autenticação
- Cadastro e login de usuários.
- Sessões armazenadas em cookies HttpOnly.

### 📖 Readlists
- Criação de listas personalizadas de livros.
- Possibilidade de favoritar e explorar listas criadas por outros usuários.

### 👤 Perfil do Usuário
- Personalização com foto, nome de usuário e pronomes.
- Visualização das próprias readlists e postagens em comunidades.

### 👥 Comunidades
- Criação e participação em comunidades de leitores.
- Publicação de posts, comentários e curtidas.
- Sistema de moderação com gerenciamento de membros, revisão de conteúdo e aprovação de posts.

### ✍️ Criador de História
- Escrita de histórias colaborativa entre usuário e inteligência artificial, utilizando Google Gemini.

### 📚 Catálogo de Livros
- Catálogo com mais de 100 livros obtidos pela Google Books API.
- Filtros por título, autor e ano de publicação.
- Página dedicada para cada livro contendo sinopse, gênero, avaliações, readlists e comunidades relacionadas.

## 🏗️ Estrutura de Projeto
```
es-unifesp-2025-2-grupo-alpha/
├── .github/workflows/                        
# Testes automatizados usando GitHub Actions (CI/CD)
|
├── documentation/         
# Documentação do projeto, incluindo designs do Figma e PDFs de estudos
|
├── livraback/                          
# Backend da aplicação em NestJS e MongoDB
|
├── livrafront/                         
# Frontend da aplicação em Next.js e Tailwind CSS
|
└── README.md
# Documentação principal do projeto                 
```

## 🛠️ Tecnologias

### Front-end (`livrafront/`)
- Next.js (TypeScript)
- Tailwind CSS
- Jest (testes)

### Back-end (`livraback/`)
- NestJS (TypeScript)
- Swagger (documentação da API)
- MongoDB (Mongoose)
- Cloudinary (imagens), Google Gemini (criador de história), RabbitMQ (mensageria)
- Jest (testes)

### System Design

<img width="1105" height="699" alt="image" src="https://github.com/user-attachments/assets/0c1090a5-32d0-4329-8b05-74c6468c579e" />

## 💻 Pré-requisitos

- Node.js (versão 18 ou superior)
- Npm
- Git

## 👥 Equipe

- **Enzo de Almeida Belfort Rizzi Di Chiara** - [@EnzoBelfort](https://github.com/EnzoBelfort)
- **Isabele de Lima Nascimento** - [@isabele7](https://github.com/isabele7)
- **João Pedro da Silva Zampoli** - [@JoaoPedroZampoli](https://github.com/JoaoPedroZampoli)
- **Letícia Akemi Ikemoto** - [@akemiikemoto](https://github.com/akemiikemoto)
- **Loren Peña Rodriguez Lorenzetto** - [@Loworen](https://github.com/Loworen)
- **Luiza de Souza Ferreira** - [@souza-luiza](https://github.com/souza-luiza)
- **Viviane Flor Park** - [@parkvivi](https://github.com/parkvivi)


