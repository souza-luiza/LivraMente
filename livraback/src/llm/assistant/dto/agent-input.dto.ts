import { IsString, IsNotEmpty } from 'class-validator';
import { IsOptional } from 'class-validator';

export class AgentInputDto {
  
  @IsString()
  @IsNotEmpty()
  userPrompt: string; // A pergunta que o usuário digitou no chat
  
  @IsOptional()
  history?: { role: 'user' | 'assistant', content: string }[];
  // (no futuro, pode ser adicionado o 'contexto' aqui, como a página atual)
}