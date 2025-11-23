import { validate } from 'class-validator';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { LlmApiService } from './llm-api.service';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmApiResponseDTO } from './dto/llm-api.response.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => {
  const actualGenAI = jest.requireActual('@google/generative-ai');
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    HarmCategory: actualGenAI.HarmCategory,
    HarmBlockThreshold: actualGenAI.HarmBlockThreshold,
  };
});

const { GoogleGenerativeAI: MockedGoogleGenerativeAI } = 
  jest.requireMock('@google/generative-ai');

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn(),
}));
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

const mockedPlainToInstance = plainToInstance as jest.Mock;
const mockedValidate = validate as jest.Mock;

describe('LlmApiService', () => {
  let service: LlmApiService;
  let consoleErrorSpy: jest.SpyInstance;
  const mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmApiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<LlmApiService>(LlmApiService);
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize GoogleGenerativeAI with API key', () => {
      mockConfigService.get.mockReturnValue('fake-key');
      service.onModuleInit();
      expect(mockConfigService.get).toHaveBeenCalledWith('GOOGLE_API_KEY');
      expect(MockedGoogleGenerativeAI).toHaveBeenCalledWith('fake-key');
    });

    it('should throw error if API key is not found', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(() => service.onModuleInit()).toThrow('GOOGLE_API_KEY was not found on .env');
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
        novasOpcoes: ['op1', 'op2', 'op3', 'op4'],
      };
      const aiResponseString = JSON.stringify(aiResponseJson);
      const mockDto = new LlmApiResponseDTO();
      mockDto.textoCapitulo = aiResponseJson.textoCapitulo;
      mockDto.novasOpcoes = aiResponseJson.novasOpcoes;

      mockGenerateContent.mockResolvedValue({ response: { text: () => aiResponseString } });
      mockedPlainToInstance.mockReturnValue(mockDto);
      mockedValidate.mockResolvedValue([]);

      const result = await service.generateContent(prompt);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        safetySettings: expect.any(Array),
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: expect.any(Object),
      });
      expect(mockedPlainToInstance).toHaveBeenCalledWith(LlmApiResponseDTO, aiResponseJson);
      expect(mockedValidate).toHaveBeenCalledWith(mockDto);
      expect(result).toBe(mockDto);
    });

    it('should throw if Google API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Google API Error'));
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'Falha em gerar o conteúdo na IA',
      );
    });

    it('should throw if safety block occurs (no response)', async () => {
      mockGenerateContent.mockResolvedValue({ response: undefined });
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'A resposta da IA foi bloqueada por filtros de segurança.',
      );
    });

    it('should throw if response text is empty', async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => '' } });
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'A IA retornou uma resposta vazia.',
      );
    });

    it('should throw if AI returns invalid JSON', async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => 'json quebrado' } });
      await expect(service.generateContent('prompt')).rejects.toThrow(
        'IA retornou um JSON inválido.',
      );
    });

    it('should throw if AI response fails DTO validation', async () => {
      const responseJson = { textoCapitulo: 'curto' };
      const mockDto = { textoCapitulo: 'curto' };
      const validationErrors = [{ property: 'textoCapitulo' }];

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(responseJson) },
      });
      mockedPlainToInstance.mockReturnValue(mockDto);
      mockedValidate.mockResolvedValue(validationErrors);

      await expect(service.generateContent('prompt')).rejects.toThrow(
        'A resposta da IA falhou na validação de segurança.',
      );
    });
  });
});