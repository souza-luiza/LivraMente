import { IsString, IsArray, IsNumber, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const number_options = 4;

class OpcaoDTO {
  @IsNumber()
  id: number;

  @IsString()
  texto: string; 
}

//sugestao que vou ver ainda
//responder em formato json ou tópicos 

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