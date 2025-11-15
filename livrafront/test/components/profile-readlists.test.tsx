import { render, screen } from '@testing-library/react'
import ProfileReadlists from '@/components/profile-readlists'

describe('ProfileReadlists Component', () => {
  describe('Rendering', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders without crashing', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders grid container with correct classes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('w-full h-fit grid grid-cols-4 gap-2 relative')
    })

    it('renders main container as a div element', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const mainDiv = container.firstChild
      expect(mainDiv?.nodeName).toBe('DIV')
    })
  })

  describe('Readlists Data', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders all 8 readlists', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const readlists = screen.getAllByRole('link')
      expect(readlists).toHaveLength(8)
    })
  })

  describe('Readlist Components', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('each readlist has unique key', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      const hrefs = Array.from(links).map(link => link.getAttribute('href'))
      const uniqueHrefs = new Set(hrefs)
      
      expect(uniqueHrefs.size).toBe(8)
    })

    it('readlist links have correct hrefs', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = screen.getAllByRole('link')
      
      expect(links[0]).toHaveAttribute('href', '/john/readlist/fantasia')
      expect(links[1]).toHaveAttribute('href', '/john/readlist/ficcao-cientifica')
      expect(links[2]).toHaveAttribute('href', '/john/readlist/romances-classicos')
      expect(links[3]).toHaveAttribute('href', '/john/readlist/thrillers-emocionantes')
      expect(links[4]).toHaveAttribute('href', '/john/readlist/historias-de-misterio')
      expect(links[5]).toHaveAttribute('href', '/john/readlist/nao-ficcao')
      expect(links[6]).toHaveAttribute('href', '/john/readlist/contos-de-horror')
      expect(links[7]).toHaveAttribute('href', '/john/readlist/aventuras-epicas')
    })

    it('all readlists use default image', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = screen.getAllByRole('img')
      
      images.forEach(image => {
        expect(image.getAttribute('src')).toContain('Readlist.svg')
      })
    })

    it('renders correct alt texts for images', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      expect(screen.getByAltText('Capa da Readlist Minha lista de fantasia')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Livros de ficção científica')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Romances clássicos')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Thrillers emocionantes')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Histórias de mistério')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Livros de não-ficção')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Contos de horror')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist Aventuras épicas')).toBeInTheDocument()
    })

    it('all images have correct Next.js Image attributes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        expect(image).toHaveAttribute('data-nimg', 'fill')
        expect(image).toHaveAttribute('decoding', 'async')
        expect(image).toHaveAttribute('loading', 'lazy')
      })
    })

    it('all images have object-cover and rounded-lg classes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        expect(image).toHaveClass('object-cover rounded-lg')
      })
    })

    it('all readlist links have hover effect classes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        expect(link).toHaveClass('hover:shadow-md transition-shadow')
      })
    })
  })

  describe('Layout and Grid', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders grid with 4 columns', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid-cols-4')
      expect(grid).toBeInTheDocument()
    })

    it('has gap between items', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.gap-2')
      expect(grid).toBeInTheDocument()
    })

    it('has full width', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.w-full')
      expect(grid).toBeInTheDocument()
    })

    it('has fit height', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.h-fit')
      expect(grid).toBeInTheDocument()
    })

    it('is positioned relative', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.relative')
      expect(grid).toBeInTheDocument()
    })

    it('each readlist card has correct flex layout', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        expect(link).toHaveClass('flex flex-col items-center')
      })
    })

    it('each readlist card has correct padding', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        expect(link).toHaveClass('p-2 pb-4')
      })
    })

    it('image containers have correct aspect ratio', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const imageContainers = container.querySelectorAll('.aspect-\\[4\\/4\\]')
      expect(imageContainers).toHaveLength(8)
    })

    it('text containers are centered', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const textContainers = container.querySelectorAll('.text-center')
      
      textContainers.forEach(textContainer => {
        expect(textContainer).toHaveClass('justify-center items-center pt-2 w-full')
      })
    })
  })

  describe('Data Structure', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders readlists in correct order', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const titles = screen.getAllByRole('heading', { level: 4 })
      
      expect(titles[0]).toHaveTextContent('Minha lista de fantasia')
      expect(titles[1]).toHaveTextContent('Livros de ficção científica')
      expect(titles[2]).toHaveTextContent('Romances clássicos')
      expect(titles[3]).toHaveTextContent('Thrillers emocionantes')
      expect(titles[4]).toHaveTextContent('Histórias de mistério')
      expect(titles[5]).toHaveTextContent('Livros de não-ficção')
      expect(titles[6]).toHaveTextContent('Contos de horror')
      expect(titles[7]).toHaveTextContent('Aventuras épicas')
    })

    it('all readlists have empty imageUrl', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        expect(image.getAttribute('src')).toContain('Readlist.svg')
      })
    })

    it('all slugs are strings', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = screen.getAllByRole('link')
      
      links.forEach((link, index) => {
        expect(link.getAttribute('href')).toBe(`/john/readlist/${mockReadlists[index].slug}`)
      })
    })
  })

  describe('Integration', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders complete grid structure with all readlists', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      
      const readlistLinks = screen.getAllByRole('link')
      expect(readlistLinks).toHaveLength(8)
      
      const titles = screen.getAllByRole('heading', { level: 4 })
      expect(titles).toHaveLength(8)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(8)
    })

    it('all readlist components are children of grid', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid')
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        expect(grid).toContainElement(link)
      })
    })

    it('maintains consistent structure across all readlists', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        const imageContainer = link.querySelector('.relative')
        const textContainer = link.querySelector('.text-center')
        
        expect(imageContainer).toBeInTheDocument()
        expect(textContainer).toBeInTheDocument()
      })
    })

    it('each readlist has exactly one image', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        const images = link.querySelectorAll('img')
        expect(images).toHaveLength(1)
      })
    })

    it('each readlist has exactly one title', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        const titles = link.querySelectorAll('h4')
        expect(titles).toHaveLength(1)
      })
    })

    it('each readlist has exactly one author', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        const authors = link.querySelectorAll('p')
        expect(authors).toHaveLength(1)
      })
    })
  })

  describe('Content Validation', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('all titles are unique', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const titles = [
        'Minha lista de fantasia',
        'Livros de ficção científica',
        'Romances clássicos',
        'Thrillers emocionantes',
        'Histórias de mistério',
        'Livros de não-ficção',
        'Contos de horror',
        'Aventuras épicas'
      ]
      
      titles.forEach(title => {
        const elements = screen.getAllByText(title)
        expect(elements).toHaveLength(1)
      })
    })

    it('renders Portuguese content correctly', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      expect(screen.getByText('Livros de ficção científica')).toBeInTheDocument()
      expect(screen.getByText('Livros de não-ficção')).toBeInTheDocument()
      expect(screen.getByText('Histórias de mistério')).toBeInTheDocument()
    })

    it('handles special characters in titles', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      expect(screen.getByText('Livros de não-ficção')).toBeInTheDocument()
    })

    it('all titles have meaningful content', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const titles = screen.getAllByRole('heading', { level: 4 })
      
      titles.forEach(title => {
        expect(title.textContent).toBeTruthy()
        expect(title.textContent?.length).toBeGreaterThan(5)
      })
    })

    it('renders diverse genre titles', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const genres = ['fantasia', 'ficção científica', 'clássicos', 'Thrillers', 'mistério', 'não-ficção', 'horror', 'épicas']
      
      genres.forEach(genre => {
        const element = screen.getByText(new RegExp(genre, 'i'))
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('all images have alt text', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        expect(image).toHaveAttribute('alt')
        expect(image.getAttribute('alt')).toBeTruthy()
      })
    })

    it('all links are accessible', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href')
      })
    })

    it('headings are properly structured', () => {
      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const headings = screen.getAllByRole('heading', { level: 4 })
      
      expect(headings).toHaveLength(8)
      headings.forEach(heading => {
        expect(heading.tagName).toBe('H4')
      })
    })

    it('all alt texts are descriptive', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        const alt = image.getAttribute('alt')
        expect(alt).toContain('Capa da Readlist')
        expect(alt?.length).toBeGreaterThan(15)
      })
    })

    it('links have sufficient context', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        const title = link.querySelector('h4')
        const author = link.querySelector('p')
        
        expect(title).toBeInTheDocument()
        expect(author).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('renders efficiently without errors', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      expect(container).toBeInTheDocument()
      expect(container.querySelector('.grid')).toBeInTheDocument()
    })

    it('does not create duplicate elements', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grids = container.querySelectorAll('.grid-cols-4')
      expect(grids).toHaveLength(1)
    })

    it('renders exactly 8 readlists without extras', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      const images = container.querySelectorAll('img')
      const titles = container.querySelectorAll('h4')
      const authors = container.querySelectorAll('p')
      
      expect(links).toHaveLength(8)
      expect(images).toHaveLength(8)
      expect(titles).toHaveLength(8)
      expect(authors).toHaveLength(8)
    })

    it('renders with minimal DOM depth', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid')
      const firstLink = grid?.querySelector('a')
      
      expect(grid).toBeInTheDocument()
      expect(firstLink).toBeInTheDocument()
      expect(grid?.children.length).toBe(8)
    })
  })

  describe('Responsive Design', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('grid container has responsive width', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('w-full')
    })

    it('maintains grid layout structure', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-4')
    })

    it('all readlist cards have full width', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = container.querySelectorAll('a')
      
      links.forEach(link => {
        expect(link).toHaveClass('w-full')
      })
    })

    it('images are responsive with fill layout', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const images = container.querySelectorAll('img')
      
      images.forEach(image => {
        expect(image).toHaveAttribute('data-nimg', 'fill')
      })
    })
  })

  describe('Typography', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('titles have correct typography classes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const titles = container.querySelectorAll('h4')
      
      titles.forEach(title => {
        expect(title).toHaveClass('text-h5 font-bold truncate')
      })
    })

    it('authors have correct typography classes', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const authors = container.querySelectorAll('p')
      
      authors.forEach(author => {
        expect(author).toHaveClass('text-b2 font-semibold truncate')
      })
    })

    it('all text elements have truncate class', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const textElements = container.querySelectorAll('h4, p')
      
      textElements.forEach(element => {
        expect(element).toHaveClass('truncate')
      })
    })
  })

  describe('Image Containers', () => {
    const mockReadlists = [
      { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
      { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
      { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
      { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
      { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
      { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
      { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
      { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
    ];
    it('all image containers have relative positioning', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const imageContainers = container.querySelectorAll('a > .relative')
      
      expect(imageContainers).toHaveLength(8)
      imageContainers.forEach(imageContainer => {
        expect(imageContainer).toHaveClass('relative w-full aspect-[4/4]')
      })
    })

    it('image containers maintain aspect ratio', () => {
      const { container } = render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const imageContainers = container.querySelectorAll('.aspect-\\[4\\/4\\]')
      
      imageContainers.forEach(imageContainer => {
        expect(imageContainer).toHaveClass('aspect-[4/4]')
      })
    })
  })

  describe('Map Function Behavior', () => {
    it('maps all 8 readlist objects correctly', () => {
      const mockReadlists = [
        { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
        { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
        { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
        { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
        { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
        { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
        { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
        { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
      ];

      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const links = screen.getAllByRole('link')
      
      expect(links).toHaveLength(8)
      
      for (let i = 0; i < 8; i++) {
        expect(links[i]).toHaveAttribute('href', `/john/readlist/${mockReadlists[i].slug}`)
      }
    })

    it('preserves data order during mapping', () => {
      const mockReadlists = [
        { _id: '1', nome: 'Minha lista de fantasia', favorito: false, publica: true, criador: 'john', slug: 'fantasia', livros:[] },
        { _id: '2', nome: 'Livros de ficção científica', favorito: false, publica: true, criador: 'john', slug: 'ficcao-cientifica', livros:[] },
        { _id: '3', nome: 'Romances clássicos', favorito: false, publica: true, criador: 'john', slug: 'romances-classicos', livros:[] },
        { _id: '4', nome: 'Thrillers emocionantes', favorito: false, publica: true, criador: 'john', slug: 'thrillers-emocionantes', livros:[] },
        { _id: '5', nome: 'Histórias de mistério', favorito: false, publica: true, criador: 'john', slug: 'historias-de-misterio', livros:[] },
        { _id: '6', nome: 'Livros de não-ficção', favorito: false, publica: true, criador: 'john', slug: 'nao-ficcao', livros:[] },
        { _id: '7', nome: 'Contos de horror', favorito: false, publica: true, criador: 'john', slug: 'contos-de-horror', livros:[] },
        { _id: '8', nome: 'Aventuras épicas', favorito: false, publica: true, criador: 'john', slug: 'aventuras-epicas', livros:[] },
      ];

      render(<ProfileReadlists readlists={mockReadlists} username={'john'} />)
      
      const titles = screen.getAllByRole('heading', { level: 4 })
      const expectedOrder = [
        'Minha lista de fantasia',
        'Livros de ficção científica',
        'Romances clássicos',
        'Thrillers emocionantes',
        'Histórias de mistério',
        'Livros de não-ficção',
        'Contos de horror',
        'Aventuras épicas'
      ]
      
      titles.forEach((title, index) => {
        expect(title).toHaveTextContent(expectedOrder[index])
      })
    })
  })
})