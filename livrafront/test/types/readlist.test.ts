import { 
  Readlist, 
  CreateReadlistData, 
  UpdateReadlistData, 
  ReadlistDetailResponse,
  Book 
} from '@/types/readlist';

describe('Readlist Types', () => {
  describe('Book interface', () => {
    it('should have correct structure', () => {
      const book: Book = {
        id: '1',
        title: 'Test Book',
        year: '2024',
        pages: '300 pags',
        rating: 5,
        cover: '/test.jpg'
      };

      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('year');
      expect(book).toHaveProperty('pages');
      expect(book).toHaveProperty('rating');
      expect(book).toHaveProperty('cover');
    });
  });

  describe('Readlist interface', () => {
    it('should have correct structure with required fields', () => {
      const readlist: Readlist = {
        _id: 'readlist-123',
        nome: 'Test Readlist',
        favorito: false,
        publica: true,
        criador: 'user-123',
        livros: ['book-1', 'book-2']
      };

      expect(readlist).toHaveProperty('_id');
      expect(readlist).toHaveProperty('nome');
      expect(readlist).toHaveProperty('favorito');
      expect(readlist).toHaveProperty('publica');
      expect(readlist).toHaveProperty('criador');
      expect(readlist).toHaveProperty('livros');
      expect(Array.isArray(readlist.livros)).toBe(true);
    });

    it('should allow optional fields', () => {
      const readlist: Readlist = {
        _id: 'readlist-123',
        nome: 'Test Readlist',
        favorito: false,
        publica: true,
        criador: 'user-123',
        livros: [],
        descricao: 'Test description',
        capa_url: 'https://example.com/cover.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };

      expect(readlist.descricao).toBe('Test description');
      expect(readlist.capa_url).toBe('https://example.com/cover.jpg');
      expect(readlist.createdAt).toBeDefined();
      expect(readlist.updatedAt).toBeDefined();
    });
  });

  describe('CreateReadlistData interface', () => {
    it('should have correct structure with required nome field', () => {
      const createData: CreateReadlistData = {
        nome: 'New Readlist'
      };

      expect(createData).toHaveProperty('nome');
      expect(createData.nome).toBe('New Readlist');
    });

    it('should allow all optional fields', () => {
      const createData: CreateReadlistData = {
        nome: 'New Readlist',
        favorito: true,
        publica: false,
        descricao: 'My description',
        capa_url: 'https://example.com/cover.jpg'
      };

      expect(createData.favorito).toBe(true);
      expect(createData.publica).toBe(false);
      expect(createData.descricao).toBe('My description');
      expect(createData.capa_url).toBe('https://example.com/cover.jpg');
    });
  });

  describe('UpdateReadlistData interface', () => {
    it('should allow updating individual fields', () => {
      const updateData: UpdateReadlistData = {
        nome: 'Updated Name'
      };

      expect(updateData.nome).toBe('Updated Name');
    });

    it('should allow updating multiple fields', () => {
      const updateData: UpdateReadlistData = {
        nome: 'Updated Name',
        descricao: 'Updated description',
        publica: false,
        favorito: true,
        capa_url: 'https://example.com/new-cover.jpg'
      };

      expect(updateData.nome).toBe('Updated Name');
      expect(updateData.descricao).toBe('Updated description');
      expect(updateData.publica).toBe(false);
      expect(updateData.favorito).toBe(true);
      expect(updateData.capa_url).toBe('https://example.com/new-cover.jpg');
    });

    it('should allow partial updates', () => {
      const updateData: UpdateReadlistData = {
        descricao: 'Only updating description'
      };

      expect(updateData.descricao).toBe('Only updating description');
      expect(updateData.nome).toBeUndefined();
      expect(updateData.publica).toBeUndefined();
    });
  });

  describe('ReadlistDetailResponse interface', () => {
    it('should extend Readlist with populated books', () => {
      const detailResponse: ReadlistDetailResponse = {
        _id: 'readlist-123',
        nome: 'Test Readlist',
        favorito: false,
        publica: true,
        criador: 'user-123',
        livros: [
          {
            id: '1',
            title: 'Book 1',
            year: '2024',
            pages: '300 pags',
            rating: 5,
            cover: '/cover1.jpg'
          },
          {
            id: '2',
            title: 'Book 2',
            year: '2023',
            pages: '250 pags',
            rating: 4,
            cover: '/cover2.jpg'
          }
        ]
      };

      expect(detailResponse.livros).toHaveLength(2);
      expect(detailResponse.livros[0]).toHaveProperty('title');
      expect(detailResponse.livros[0]).toHaveProperty('cover');
      expect(typeof detailResponse.livros[0]).toBe('object');
    });

    it('should allow empty books array', () => {
      const detailResponse: ReadlistDetailResponse = {
        _id: 'readlist-123',
        nome: 'Empty Readlist',
        favorito: false,
        publica: true,
        criador: 'user-123',
        livros: []
      };

      expect(Array.isArray(detailResponse.livros)).toBe(true);
      expect(detailResponse.livros).toHaveLength(0);
    });
  });

  describe('Type safety', () => {
    it('should enforce required fields in Readlist', () => {
      // This test validates TypeScript compilation
      // If it compiles, the type is correct
      const readlist: Readlist = {
        _id: 'id',
        nome: 'nome',
        favorito: false,
        publica: true,
        criador: 'user',
        livros: []
      };

      expect(readlist._id).toBeDefined();
    });

    it('should enforce required fields in CreateReadlistData', () => {
      const data: CreateReadlistData = {
        nome: 'Required name'
      };

      expect(data.nome).toBeDefined();
    });

    it('should allow all fields to be optional in UpdateReadlistData', () => {
      const data: UpdateReadlistData = {};

      expect(Object.keys(data)).toHaveLength(0);
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should model a complete readlist creation', () => {
      const createData: CreateReadlistData = {
        nome: 'Meus Favoritos 2024',
        descricao: 'Livros que adorei este ano',
        publica: true,
        favorito: true,
        capa_url: 'https://picsum.photos/400/600'
      };

      expect(createData).toBeDefined();
      expect(typeof createData.nome).toBe('string');
      expect(typeof createData.publica).toBe('boolean');
    });

    it('should model a readlist update operation', () => {
      const updateData: UpdateReadlistData = {
        descricao: 'Descrição atualizada',
        publica: false
      };

      expect(updateData.descricao).toBe('Descrição atualizada');
      expect(updateData.publica).toBe(false);
    });

    it('should model API response with books', () => {
      const apiResponse: ReadlistDetailResponse = {
        _id: '507f1f77bcf86cd799439011',
        nome: 'Clássicos',
        descricao: 'Grandes clássicos da literatura',
        favorito: false,
        publica: true,
        capa_url: 'https://picsum.photos/400/603',
        criador: '507f1f77bcf86cd799439012',
        livros: [
          {
            id: 'book-1',
            title: 'Dom Casmurro',
            year: '1899',
            pages: '256 pags',
            rating: 5,
            cover: 'https://example.com/dom-casmurro.jpg'
          }
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };

      expect(apiResponse._id).toMatch(/^[a-f0-9]{24}$/);
      expect(apiResponse.livros[0].title).toBe('Dom Casmurro');
    });
  });
});
