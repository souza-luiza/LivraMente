import { validate } from 'class-validator';
import { UpdateCommentDto } from './update-comment.dto';
import { CreateCommentDto } from './create-comment.dto';

describe('UpdateCommentDto', () => {
  let updateCommentDto: UpdateCommentDto;

  beforeEach(() => {
    updateCommentDto = new UpdateCommentDto();
  });

  describe('inheritance from CreateCommentDto', () => {
    it('should inherit all properties from CreateCommentDto', () => {
      updateCommentDto.conteudo = 'test';
      updateCommentDto.imagens = ['https://example.com/img.jpg'];

      expect(updateCommentDto.conteudo).toBe('test');
      expect(Array.isArray(updateCommentDto.imagens)).toBeTruthy();
    });

    it('should make all properties optional', async () => {
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('partial validation', () => {
    it('should validate when only conteudo is provided', async () => {
      updateCommentDto.conteudo = 'Updated comment content';
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when only imagens is provided', async () => {
      updateCommentDto.imagens = ['https://example.com/new-image.jpg'];
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when both fields are provided', async () => {
      updateCommentDto.conteudo = 'Updated comment with images';
      updateCommentDto.imagens = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate when no fields are provided', async () => {
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('field validation rules (when provided)', () => {
    it('should fail validation when conteudo is empty string', async () => {
      updateCommentDto.conteudo = '';
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when conteudo is not a string', async () => {
      updateCommentDto.conteudo = 123 as any;
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('conteudo');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when imagens is not an array', async () => {
      updateCommentDto.imagens = 'not-an-array' as any;
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imagens');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail validation when imagens contains non-string values', async () => {
      updateCommentDto.imagens = ['valid-url', 123, true] as any;
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imagens');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('valid partial updates', () => {
    it('should accept valid conteudo update', async () => {
      updateCommentDto.conteudo = 'This is an updated comment';
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid imagens update', async () => {
      updateCommentDto.imagens = ['https://example.com/updated-image.jpg'];
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept empty imagens array', async () => {
      updateCommentDto.imagens = [];
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept null for imagens', async () => {
      updateCommentDto.imagens = null as any;
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept undefined for imagens', async () => {
      updateCommentDto.imagens = undefined;
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple valid partial updates', async () => {
      const partialUpdate: UpdateCommentDto = {
        conteudo: 'Updated content',
        imagens: ['img1.jpg', 'img2.jpg']
      };
      const instance = Object.assign(new UpdateCommentDto(), partialUpdate);
      const errors = await validate(instance);
      expect(errors).toHaveLength(0);
    });

    it('should handle single field partial update', async () => {
      const partialUpdate: UpdateCommentDto = {
        conteudo: 'Only updating content'
      };
      const instance = Object.assign(new UpdateCommentDto(), partialUpdate);
      const errors = await validate(instance);
      expect(errors).toHaveLength(0);
    });

    it('should handle empty partial update object', async () => {
      const emptyUpdate = new UpdateCommentDto();
      
      const errors = await validate(emptyUpdate);
      expect(errors).toHaveLength(0);
    });
  });

  describe('comparison with CreateCommentDto', () => {
    it('should be more permissive than CreateCommentDto', async () => {
      const createDto = new CreateCommentDto();
      const updateDto = new UpdateCommentDto();

      const createErrors = await validate(createDto);
      const updateErrors = await validate(updateDto);

      expect(createErrors.length).toBeGreaterThan(0);
      expect(updateErrors).toHaveLength(0);
    });

    it('should enforce same validation rules when fields are provided', async () => {
      const createDto = new CreateCommentDto();
      createDto.conteudo = '';
      
      const updateDto = new UpdateCommentDto();
      updateDto.conteudo = '';

      const createErrors = await validate(createDto);
      const updateErrors = await validate(updateDto);

      expect(createErrors.length).toBeGreaterThan(0);
      expect(updateErrors.length).toBeGreaterThan(0);
    });
  });
});