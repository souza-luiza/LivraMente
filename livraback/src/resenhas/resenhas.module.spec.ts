import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../schemas/post.schema', () => ({
  Post: { name: 'Post' },
  PostSchema: { name: 'PostSchema' }
}));

jest.mock('../comunidades/entities/comunidade.entity', () => ({
  Comunidade: { name: 'Comunidade' },
  ComunidadeSchema: { name: 'ComunidadeSchema' }
}));

jest.mock('../users/entities/user.entity', () => ({
  User: { name: 'User' },
  UserSchema: { name: 'UserSchema' }
}));

jest.mock('../schemas/comentario.schema', () => ({
  Comentario: { name: 'Comentario' },
  ComentarioSchema: { name: 'ComentarioSchema' }
}));

jest.mock('./entities/resenha.schema', () => ({
  Resenha: { name: 'Resenha' },
  ResenhaSchema: { name: 'ResenhaSchema' }
}));

jest.mock('../livros/entities/livro.schema', () => ({
  Livro: { name: 'Livro' },
  LivroSchema: { name: 'LivroSchema' }
}));
jest.mock('@nestjs/mongoose', () => {
  const real = jest.requireActual('@nestjs/mongoose');
  return {
    ...real,
    MongooseModule: {
      forFeature: jest.fn().mockImplementation((schemas: any[]) => ({
        module: class MongooseModuleForFeature {},
        imports: [],
        // Nest's getModelToken uses '<ModelName>Model' as token, so provide that here
        providers: schemas.map((s: any) => ({ provide: `${s.name}Model`, useValue: {} })),
        exports: schemas.map((s: any) => `${s.name}Model`),
      }))
    }
  };
});

// Require modules after mocks so imports pick up mocked implementations


describe('ResenhasModule', () => {
  let module: TestingModule;

  describe('module configuration', () => {
    it('should compile the module successfully', async () => {
      module = await Test.createTestingModule({
        imports: [ResenhasModule],
      }).compile();

      expect(module).toBeDefined();
    });

    it('should have MongooseModule.forFeature with correct schemas', () => {
      const mongooseForFeatureCall = (MongooseModule.forFeature as jest.Mock).mock.calls[0][0];

      expect(MongooseModule.forFeature).toHaveBeenCalledTimes(1);
      expect(MongooseModule.forFeature).toHaveBeenCalledWith([
        { name: 'Post', schema: { name: 'PostSchema' } },
        { name: 'Comunidade', schema: { name: 'ComunidadeSchema' } },
        { name: 'Resenha', schema: { name: 'ResenhaSchema' } },
        { name: 'Livro', schema: { name: 'LivroSchema' } },
        { name: 'User', schema: { name: 'UserSchema' } },
        { name: 'Comentario', schema: { name: 'ComentarioSchema' } }
      ]);

      expect(Array.isArray(mongooseForFeatureCall)).toBe(true);
      expect(mongooseForFeatureCall).toHaveLength(6);

      expect(mongooseForFeatureCall[0]).toEqual({
        name: 'Post',
        schema: { name: 'PostSchema' }
      });

      expect(mongooseForFeatureCall[1]).toEqual({
        name: 'Comunidade',
        schema: { name: 'ComunidadeSchema' }
      });

      expect(mongooseForFeatureCall[2]).toEqual({
        name: 'Resenha',
        schema: { name: 'ResenhaSchema' }
      });

      expect(mongooseForFeatureCall[3]).toEqual({
        name: 'Livro',
        schema: { name: 'LivroSchema' }
      });

      expect(mongooseForFeatureCall[4]).toEqual({
        name: 'User',
        schema: { name: 'UserSchema' }
      });

      expect(mongooseForFeatureCall[5]).toEqual({
        name: 'Comentario',
        schema: { name: 'ComentarioSchema' }
      });
    });
  });

  describe('module providers', () => {
    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [ResenhasModule],
      }).compile();
    });

    it('should provide ResenhasService', () => {
      const resenhasService = module.get(ResenhasService);
      expect(resenhasService).toBeDefined();
      expect(resenhasService).toBeInstanceOf(ResenhasService);
    });

    it('should export ResenhasService', () => {
      const provided = module.get(ResenhasService);
      expect(provided).toBeDefined();
    });
  });

  describe('module controllers', () => {
    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [ResenhasModule],
      }).compile();
    });

    it('should provide ResenhasController', () => {
      const resenhasController = module.get(ResenhasController);
      expect(resenhasController).toBeDefined();
      expect(resenhasController).toBeInstanceOf(ResenhasController);
    });
  });

  describe('module imports', () => {
    it('should import MongooseModule with forFeature', () => {
      expect(MongooseModule.forFeature).toHaveBeenCalled();
    });
  });

  describe('module structure', () => {
    it('should have correct module metadata', () => {
      const resenhasModule = new ResenhasModule();

      expect(resenhasModule).toBeDefined();
      expect(resenhasModule).toBeInstanceOf(ResenhasModule);
    });

    it('should have all required properties in module definition', () => {
      const moduleProperties = Object.keys(ResenhasModule);
      
      expect(typeof ResenhasModule).toBe('function');
    });
  });

  describe('schema names verification', () => {
    it('should use correct schema names in MongooseModule', () => {
      const mongooseForFeatureCall = (MongooseModule.forFeature as jest.Mock).mock.calls[0][0];
      
      const schemaNames = mongooseForFeatureCall.map((item: any) => item.name);
      expect(schemaNames).toEqual([
        'Post',
        'Comunidade',
        'Resenha',
        'Livro',
        'User',
        'Comentario'
      ]);
    });

    it('should have schema definitions for all entities', () => {
      const mongooseForFeatureCall = (MongooseModule.forFeature as jest.Mock).mock.calls[0][0];
      
      mongooseForFeatureCall.forEach((item: any) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('schema');
        expect(typeof item.name).toBe('string');
        expect(item.schema).toBeDefined();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty module compilation', async () => {
      await expect(Test.createTestingModule({
        imports: [ResenhasModule],
      }).compile()).resolves.toBeDefined();
    });

    it('should have proper module dependencies', () => {
      const moduleInstance = new ResenhasModule();
      expect(moduleInstance).toBeInstanceOf(ResenhasModule);
    });
  });
});

describe('ResenhasModule Metadata', () => {
  it('should have correct decorator configuration', () => {
    // Validate that module wiring results in the controller and service being available
    return Test.createTestingModule({ imports: [ResenhasModule] }).compile().then((compiled) => {
      expect(compiled.get(ResenhasController)).toBeDefined();
      expect(compiled.get(ResenhasService)).toBeDefined();
    });
  });

  it('should verify module is exported correctly', () => {
    expect(ResenhasModule).toBeDefined();
    expect(typeof ResenhasModule).toBe('function');
  });
});

const { MongooseModule } = require('@nestjs/mongoose');
const { ResenhasModule } = require('./resenhas.module');
const { ResenhasService } = require('./resenhas.service');
const { ResenhasController } = require('./resenhas.controller');