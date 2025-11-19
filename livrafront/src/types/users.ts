export interface Gamificacao {
  XP: number;
  XP_proximo_nivel: number;
  nivel: number;
}

export interface UserProfile {
  username: string;
  email: string;
  amigos?: string[];
  posts?: string[];
  gamificação?: Gamificacao;
  avatarUrl: string;
  pronouns: string;
}