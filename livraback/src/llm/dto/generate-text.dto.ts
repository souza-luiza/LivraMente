import { IsArray, IsString, IsNumber, IsOptional, ArrayNotEmpty, Min, Max } from 'class-validator';

export class GerarTextoDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // Cada item deve ser string
  genres: string[];

  @IsNumber()
  @Min(100)
  @Max(600)
  wordLimit: number;

  @IsOptional()
  @IsString()
  userWriting?: string;

  @IsOptional()
  @IsString()
  storyId?: string;
}