/**
 * DTOs para eventos de notificação
 * Garante type safety e validação de dados nas mensagens do RabbitMQ
 */

export interface PostCriadoEventDto {
  postId: string;
  autorId: string;
  comunidadeId: string;
  comunidadeNome: string;
  conteudo: string;
}

export interface PostCurtidoEventDto {
  postId: string;
  userId: string;
  autorId: string;
  comunidadeNome: string;
}

export interface PostModeradoEventDto {
  postId: string;
  autorId: string;
  aprovado: boolean;
  categoria: string | null;
}

export interface MembroEntrouEventDto {
  userId: string;
  comunidadeId: string;
  comunidadeNome: string;
}

export interface ComentarioCriadoEventDto {
  comentarioId: string;
  postId: string;
  autorComentarioId: string;
  autorPostId: string;
  conteudo: string;
  comunidadeNome: string;
}

export interface ComentarioCurtidoEventDto {
  comentarioId: string;
  postId: string;
  userId: string;
  autorId: string;
  comunidadeNome: string;
}

export type NotificationEventDto =
  | PostCriadoEventDto
  | PostCurtidoEventDto
  | PostModeradoEventDto
  | MembroEntrouEventDto
  | ComentarioCriadoEventDto
  | ComentarioCurtidoEventDto;
