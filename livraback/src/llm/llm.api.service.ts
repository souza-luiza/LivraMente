import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LlmResponseDTO } from './dto/llm-response.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class LlmApiService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) { } // Para ler o .env

  onModuleInit() {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY')
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY was not found on .env')
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey });
  }

  async generateContent(prompt: string): Promise<LlmResponseDTO> {
    const modelName = 'gemini-1.5-flash';
    let jsonString: string; // Variável para armazenar a resposta da API

    try {
      const result = await this.ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }]
      });

      const response = (result as any).response;
      jsonString = response.text(); // Armazena a resposta

    } catch (error) {
      console.error(`Error calling Gemini's API (${modelName}):`, error);
      throw new InternalServerErrorException('Falha em gerar o conteúdo na IA');
    }
    let responseObject;
    try {
      responseObject = JSON.parse(jsonString);
    } catch (e) {
      console.error("Parsing error: AI doesn't return a valid JSON.", jsonString);
      throw new InternalServerErrorException('IA retornou um JSON inválido.');
    }

    const responseDto = plainToInstance(LlmResponseDTO, responseObject);
    const errors = await validate(responseDto);

    if (errors.length > 0) {
      console.error('Error validating AI response:', errors);
      throw new InternalServerErrorException('A resposta da IA falhou na validação de segurança.');
    }
    
    return responseDto;
  }
}