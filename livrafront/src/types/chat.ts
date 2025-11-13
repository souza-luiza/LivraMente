export type Role = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  options?: { id: number; texto: string }[];
  ts: number;
};

export type GenerateTextDTO = {
  genres?: string[];
  wordLimit?: number;     // 100–600
  userWriting?: string;   // texto digitado
  storyId?: string | null;
};

export type LlmResponseDTO = {
  storyId: string;
  textoCapitulo: string;
  novasOpcoes: { id: number; texto: string }[];
};

export type ChatState = {
  messages: ChatMessage[];
  storyId: string | null;
  isOpen: boolean;
  isLoading: boolean;
};
