import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LlmResponseDTO {

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000) 
  textoCapitulo: string; 

}