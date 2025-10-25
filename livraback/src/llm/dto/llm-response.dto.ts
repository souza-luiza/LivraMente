import { IsString, IsArray, IsNumber, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const number_options = 4; // Número exato de opções que devem ser fornecidas, ajuste conforme necessário

class OpcaoDTO {
  @IsNumber()
  id: number;

  @IsString()
  texto: string; 
}

// Classe principal
export class LlmResponseDTO {
  @IsString()
  textoCapitulo: string;

  @IsArray()
  @ArrayMinSize(number_options)
  @ValidateNested({ each: true })
  @Type(() => OpcaoDTO)
  novasOpcoes: OpcaoDTO[];
}