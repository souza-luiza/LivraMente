import { IsArray, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GenerateTextDTO {
  @IsArray()
  @IsString({ each: true }) // Cada item deve ser string
  @IsOptional()
  genres?: string[];

  @IsNumber()
  @Min(100)
  @Max(600)
  @IsOptional()
  wordLimit?: number;

  @IsOptional()
  @IsString()
  userWriting?: string;

  @IsOptional()
  @IsString()
  storyId?: string;
}