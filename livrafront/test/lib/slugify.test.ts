import { titleToSlug, slugToTitle } from '../../src/lib/slugify'

describe('slugify utils', () => {
  describe('titleToSlug', () => {
    it('removes accents, lowercases and replaces spaces with hyphens', () => {
      expect(titleToSlug('Título Exemplo!')).toBe('titulo-exemplo')
    })

    it('collapses multiple spaces and trims', () => {
      expect(titleToSlug('  Espaços   múltiplos  ')).toBe('espacos-multiplos')
    })

    it('returns empty string for empty input', () => {
      expect(titleToSlug('')).toBe('')
    })

    it('removes invalid characters', () => {
      expect(titleToSlug('Hello @# World!!')).toBe('hello-world')
    })
  })

  describe('slugToTitle', () => {
    it('converts slug to human title case', () => {
      expect(slugToTitle('minha-readlist')).toBe('Minha Readlist')
    })

    it('returns empty string for empty slug', () => {
      expect(slugToTitle('')).toBe('')
    })
  })
})
