# LivraBack
## Back-end do projeto LivraMente
<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" height='100px'/>       
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-plain-wordmark.svg" height='100px'/>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Estrutura do esquemas do Banco de Dados

schemas/
├── index.ts              → Exporta todos os schemas
├── user.schema.ts        → User (subdocumentos Perfil, Estante, Gamificação)
├── readlist.schema.ts    → Readlist 
├── livro.schema.ts       → Livro
├── autor.schema.ts       → Autor
├── post.schema.ts        → Postagem
├── comentario.schema.ts  → Comentario
├── comunidade.schema.ts  → Comunidade
├── quiz.schema.ts        → Quiz
└── resenha.schema.ts     → Resenha
