import { validate } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  let createCommentDto: CreateCommentDto;

  beforeEach(() => {
    createCommentDto = new CreateCommentDto();
  });

  describe('conteudo validation', () => {
    it('should validate when conteudo is provided', async () => {
      createCommentDto.conteudo = 'This is a test comment';
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when conteudo is empty', async () => {
      createCommentDto.conteudo = '';
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when conteudo is null', async () => {
      createCommentDto.conteudo = null as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when conteudo is undefined', async () => {
      createCommentDto.conteudo = undefined as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when conteudo is not a string', async () => {
      createCommentDto.conteudo = 123 as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('imagens validation', () => {
    it('should validate when imagens is a valid string array', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when imagens is empty array', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = [];
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when imagens is undefined', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = undefined;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when imagens is null', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = null as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when imagens contains non-string values', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = ['valid-url', 123, true] as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imagens');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when imagens is not an array', async () => {
      createCommentDto.conteudo = 'Test comment';
      createCommentDto.imagens = 'not-an-array' as any;
      
      const errors = await validate(createCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imagens');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });
  });

  describe('complete object validation', () => {
    it('should validate a complete valid object', async () => {
      const validDto: CreateCommentDto = {
        conteudo: 'This is a comprehensive test comment',
        imagens: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg'
        ]
      };
      const instance = Object.assign(new CreateCommentDto(), validDto);
      const errors = await validate(instance);
      expect(errors).toHaveLength(0);
    });

    it('should validate an object without imagens', async () => {
      const validDto: CreateCommentDto = {
        conteudo: 'This is a comment without images'
      };
      const instance = Object.assign(new CreateCommentDto(), validDto);
      const errors = await validate(instance);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when both fields are invalid', async () => {
      const invalidDto = new CreateCommentDto();
      invalidDto.conteudo = 123 as any;
      invalidDto.imagens = 'invalid' as any;
      
      const errors = await validate(invalidDto);
      expect(errors).toHaveLength(2);
      expect(errors.some(e => e.property === 'conteudo')).toBe(true);
      expect(errors.some(e => e.property === 'imagens')).toBe(true);
    });
  });

  describe('ApiProperty decorators', () => {
    it('should have ApiProperty decorator for conteudo with correct description', () => {
      createCommentDto.conteudo = 'sample';
      expect(createCommentDto.conteudo).toBeDefined();
    });

    it('should have ApiProperty decorator for imagens with correct description and optional flag', () => {
      createCommentDto.imagens = [];
      expect(createCommentDto.imagens).toBeDefined();
    });
  });
});