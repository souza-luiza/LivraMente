/* Interfaces de dados usadas na autenticação*/

/* Dados do formulário de login */
export interface LoginFormData {
  email: string
  password: string
}

/* Dados do usuário autenticado */
export interface User {
  _id: string
  email: string
  username: string
}

 /* Resposta da API de login */
export interface LoginResponse {
  token: string
  user: User
}