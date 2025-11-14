import type { GenerateTextDTO, LlmResponseDTO } from '@/types/chat';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
if (!BASE) console.warn('NEXT_PUBLIC_API_BASE_URL não definido.');

export async function postGenerateText(
  payload: GenerateTextDTO,
  signal?: AbortSignal
): Promise<LlmResponseDTO> {
  const res = await fetch(`${BASE}/llm/gerar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
