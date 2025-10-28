import { validate } from 'class-validator';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { LlmApiService } from './llm.api.service';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmResponseDTO } from './dto/llm-response.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockGenerateContent = jest.fn();
const mockGoogleGenAI = jest.fn(() => ({
  models: {
    generateContent: mockGenerateContent,
  },
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: mockGoogleGenAI,
}));

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(),
}));
jest.mock('class-validator', () => ({
  validate: jest.fn(),
}));

const mockedPlainToInstance = plainToInstance as jest.Mock;
const mockedValidate = validate as jest.Mock;

describe('LlmApiService', () => {
  let service: LlmApiService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmApiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<LlmApiService>(LlmApiService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize GoogleGenAI with API key', () => {
      mockConfigService.get.mockReturnValue('fake-key');
      service.onModuleInit();

      expect(mockConfigService.get).toHaveBeenCalledWith('GOOGLE_API_KEY');
      expect(mockGoogleGenAI).toHaveBeenCalledWith({ apiKey: 'fake-key' });
    });

    it('should throw error if API key is not found', () => {
      mockConfigService.get.mockReturnValue(undefined);
      
      // Verifica se a função lança o erro esperado
      expect(() => service.onModuleInit()).toThrow(
        'GOOGLE_API_KEY was not found on .env',
      );
    });
  });

  describe('generateContent', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('fake-key');
      service.onModuleInit();
    });

    it('should return a validated DTO on success', async () => {
      const prompt = 'test prompt';
      const aiResponseJson = {
        textoCapitulo: 'O capítulo...',
        novasOpcoes: [],
      };
      const aiResponseString = JSON.stringify(aiResponseJson);
      
      const mockDto = new LlmResponseDTO();
      mockDto.textoCapitulo = aiResponseJson.textoCapitulo;
      mockDto.novasOpcoes = aiResponseJson.novasOpcoes;

      // Simula a resposta da API
      mockGenerateContent.mockResolvedValue({
        response: { text: () => aiResponseString },
      });
      // Simula o plainToInstance
      mockedPlainToInstance.mockReturnValue(mockDto);
      // Simula a validação (sem erros)
      mockedValidate.mockResolvedValue([]); 

      const result = await service.generateContent(prompt);

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(JSON.parse(aiResponseString)).toEqual(aiResponseJson);
      expect(mockedPlainToInstance).toHaveBeenCalledWith(LlmResponseDTO, aiResponseJson);
      expect(mockedValidate).toHaveBeenCalledWith(mockDto);
      expect(result).toBe(mockDto);
    });

    it('should throw if Google API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Google API Error'));

      await expect(service.generateContent('prompt')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'failed to generate LLM content',
      );
    });

    it('should throw if AI returns invalid JSON', async () => {
      const invalidJson = 'Isso não é um JSON {';
      mockGenerateContent.mockResolvedValue({
        response: { text: () => invalidJson },
      });

      // Act & Assert
      await expect(service.generateContent('prompt')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'IA retornou um JSON inválido.',
      );
    });

    it('should throw if AI response fails DTO validation', async () => {
      const responseJson = { textoCapitulo: 'curto' }; // Vai falhar no @Length(50, 3000)
      const mockDto = { textoCapitulo: 'curto' };
      const validationErrors = [{ property: 'textoCapitulo', constraints: {} }];

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(responseJson) },
      });
      mockedPlainToInstance.mockReturnValue(mockDto);
      // Simula a validação retornando erros
      mockedValidate.mockResolvedValue(validationErrors); 

      await expect(service.generateContent('prompt')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'The AI answer falid in segurance validation.',
      );
      expect(console.error).toHaveBeenCalledWith('Error of validation of AI:', validationErrors);
    });
  });
});