/**
 * Constantes de mensagens para o sistema de notificações
 * Centraliza textos para facilitar internacionalização futura
 */

export const NOTIFICATION_MESSAGES = {
  POST: {
    NOVO: (comunidadeNome: string, preview: string) => 
      `Novo post em ${comunidadeNome}: ${preview}...`,
    CURTIDO: 'Seu post foi curtido!',
    APROVADO: (categoria: string) => `Seu post foi aprovado na categoria ${categoria}!`,
    REJEITADO: 'Seu post foi rejeitado pela moderação.',
  },
  COMUNIDADE: {
    NOVO_MEMBRO: (comunidadeNome: string) => 
      `Novo membro entrou na comunidade ${comunidadeNome}!`,
  },
} as const;

export const ERROR_MESSAGES = {
  QUEUE: {
    CONNECTION_FAILED: 'Falha ao conectar ao RabbitMQ',
    PUBLISH_FAILED: 'Falha ao publicar mensagem',
    INVALID_MESSAGE: 'Formato de mensagem inválido',
  },
  NOTIFICATION: {
    CREATE_FAILED: 'Falha ao criar notificação',
    NOT_FOUND: 'Notificação não encontrada',
    UNAUTHORIZED: 'Usuário não autorizado para esta notificação',
  },
} as const;

export const SUCCESS_MESSAGES = {
  NOTIFICATION: {
    MARKED_AS_READ: 'Notificação marcada como lida',
    ALL_MARKED_AS_READ: 'Todas as notificações marcadas como lidas',
    DELETED: 'Notificação removida',
    ALL_DELETED: 'Todas as notificações removidas',
  },
} as const;
