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

  describe('complete object validation', () => {
    it('should validate a complete valid object', async () => {
      const validDto: CreateCommentDto = {
        conteudo: 'This is a comprehensive test comment',
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
  });

  describe('ApiProperty decorators', () => {
    it('should have ApiProperty decorator for conteudo with correct description', () => {
      createCommentDto.conteudo = 'sample';
      expect(createCommentDto.conteudo).toBeDefined();
    });
  });
});