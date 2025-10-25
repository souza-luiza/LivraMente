import { IsString, IsArray, IsNumber, Length, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const number_options = 4; // Número exato de opções que devem ser fornecidas, ajuste conforme necessário

class OpcaoDTO {
  @IsNumber()
  id: number;

  @IsString()
  @Length(3,50)
  texto: string; 
}

// Classe principal
export class LlmResponseDTO {
  @IsString()
  @Length(50,1000)
  textoCapitulo: string;

  @IsArray()
  @ArrayMinSize(number_options)
  @ValidateNested({ each: true })
  @Type(() => OpcaoDTO)
  novasOpcoes: OpcaoDTO[];
}