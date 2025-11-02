import { IsString, IsArray, Length, ArrayMinSize } from 'class-validator';

export class LlmApiResponseDTO {
  @IsString()
  @Length(50, 8000) // aumento do limite do capítulo
  textoCapitulo: string;

  @IsArray()
  @IsString({ each: true }) // A IA só precisa enviar um array de STRINGS
  @ArrayMinSize(4)
  novasOpcoes: string[];
}