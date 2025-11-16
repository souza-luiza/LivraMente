import { IsString, IsNotEmpty } from 'class-validator';

export class AgentInputDto {
  
  @IsString()
  @IsNotEmpty()
  userPrompt: string; // A pergunta que o usuário digitou no chat
  
  // (no futuro, pode ser adicionado o 'contexto' aqui, como a página atual)
}