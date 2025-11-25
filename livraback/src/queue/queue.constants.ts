export const FILAS = {
  GERAR_LLM: 'llm.gerar',
  ENVIAR_NOTIFICACOES: 'notificacoes.enviar',
  PROCESSAR_IMAGENS: 'imagens.processar',
  ENVIAR_EMAILS: 'emails.enviar',
  ATUALIZAR_METRICAS: 'metricas.atualizar',
  RASTREAR_ANALYTICS: 'analytics.rastrear',
  DLQ: 'dlq.mensagens.falhas',
} as const;

// Tópicos
export const EXCHANGES = {
  EVENTOS_LIVRAMENTE: 'livramente.eventos',
  DLQ: 'dlq.exchange',
} as const;


export const ROUTING_KEYS = {
  // LLM
  HISTORIA_LLM_SOLICITADA: 'llm.historia.solicitada',
  
  // Notificações
  NOTIFICAR_POST_CRIADO: 'notificar.post.criado',
  NOTIFICAR_POST_MODERADO: 'notificar.post.moderado',
  NOTIFICAR_COMENTARIO_CRIADO: 'notificar.comentario.criado',
  NOTIFICAR_COMENTARIO_CURTIDO: 'notificar.comentario.curtido',
  NOTIFICAR_POST_CURTIDO: 'notificar.post.curtido',
  NOTIFICAR_MEMBRO_ENTROU: 'notificar.membro.entrou',
  NOTIFICAR_READLIST_FAVORITADA: 'notificar.readlist.favoritada',
  
  // Imagens
  IMAGEM_POST_UPLOAD: 'imagem.post.upload',
  IMAGEM_COMUNIDADE_UPLOAD: 'imagem.comunidade.upload',
  IMAGEM_USUARIO_UPLOAD: 'imagem.usuario.upload',
  
  // Emails
  EMAIL_BOAS_VINDAS: 'email.boas.vindas',
  EMAIL_RESETAR_SENHA: 'email.resetar.senha',
  
  // Métricas
  METRICAS_POST_CRIADO: 'metricas.post.criado',
  METRICAS_USUARIO_LENDO: 'metricas.usuario.lendo',
  METRICAS_ATIVIDADE_COMUNIDADE: 'metricas.atividade.comunidade',
  
  // Analytics
  ANALYTICS_ACAO_USUARIO: 'analytics.acao.usuario',
} as const;


// Configurações de retry
export const CONFIG_FILA = {
  MAX_TENTATIVAS: 3,
  ATRASO_TENTATIVA: 5000, // 5 segundos
  TTL_MENSAGEM: 86400000, // 24 horas 
} as const;
