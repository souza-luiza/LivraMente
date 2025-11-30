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

      expect(updateCommentDto.conteudo).toBe('test');
    });

    it('should make all properties optional', async () => {
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
  });

  describe('valid partial updates', () => {
    it('should accept valid conteudo update', async () => {
      updateCommentDto.conteudo = 'This is an updated comment';
      
      const errors = await validate(updateCommentDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
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