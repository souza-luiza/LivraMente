import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerateContentResult, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { LlmApiResponseDTO } from './dto/llm-api.response.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class LlmApiService implements OnModuleInit {
  private ai: GoogleGenerativeAI;

  constructor(private configService: ConfigService) { } // Para ler o .env

  onModuleInit() {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY')
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY was not found on .env')
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async generateContent(prompt: string): Promise<LlmApiResponseDTO> {
    const modelName = 'gemini-2.5-flash';
    let jsonString: string;
    let result: GenerateContentResult; // Objeto de resposta da IA

    try {
      const model = this.ai.getGenerativeModel({
        model: modelName,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      result = await model.generateContent({ // Armazena o resultado
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        }
      });


    } catch (error) {
      console.error(`Error calling Gemini's API (${modelName}):`, error);
      throw new InternalServerErrorException('Falha em gerar o conteúdo na IA'); //ta dando erro aqui
    }

    const response = result.response;

    if (!response) {
      console.error("A API da Google não retornou uma 'response'. Verifique os filtros de segurança (promptFeedback):");
      console.error(JSON.stringify(result, null, 2));
      throw new InternalServerErrorException('A resposta da IA foi bloqueada por filtros de segurança.');
    }

    jsonString = response.text();
    if (!jsonString) {
      console.error("A API da Google retornou uma 'response' mas sem texto (text() está vazio).");
      throw new InternalServerErrorException('A IA retornou uma resposta vazia.');
    }

    let responseObject;
    try {
      responseObject = JSON.parse(jsonString);
    } catch (e) { 
      console.error("Parsing error: AI doesn't return a valid JSON.", jsonString);
      throw new InternalServerErrorException('IA retornou um JSON inválido.');
    }

    const responseDto = plainToInstance(LlmApiResponseDTO, responseObject);
    const errors = await validate(responseDto);

    if (errors.length > 0) {
      console.error('Error validating AI response:', errors);
      throw new InternalServerErrorException('A resposta da IA falhou na validação de segurança.');
    }

    return responseDto;
  }
}