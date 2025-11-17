import type { GenerateTextDTO, LlmResponseDTO, AgentInputDTO } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

//const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
//if (!BASE) console.warn('NEXT_PUBLIC_API_BASE_URL não definido.');

export async function postGenerateText(
  payload: GenerateTextDTO,
  token: string,
  signal?: AbortSignal
): Promise<LlmResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/llm/gerar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function postAnalyzeAgent(
  payload: AgentInputDTO,
  token: string,
  signal?: AbortSignal
): Promise<{ response: string }> {
  const res = await fetch(`${API_BASE_URL}/llm/analisar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Trata o erro 401 especificamente
    if (res.status === 401) {
      throw new Error(`401: Não autorizado. O token JWT está faltando ou é inválido.`);
    }
    throw new Error(`LLM ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}