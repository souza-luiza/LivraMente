import { render, screen } from '@testing-library/react'
import Readlist from '@/components/readlist'

describe('Readlist Component', () => {
  const defaultProps = {
    id: 'readlist-123',
    title: 'JavaScript Essentials',
    author: 'john_doe',
    image: '/covers/javascript.jpg',
  }

  describe('Rendering and Props', () => {
    it('renders readlist with all props', () => {
      render(<Readlist {...defaultProps} />)
      
      expect(screen.getByText('JavaScript Essentials')).toBeInTheDocument()
      expect(screen.getByText('john_doe')).toBeInTheDocument()
      expect(screen.getByAltText('Capa da Readlist JavaScript Essentials')).toBeInTheDocument()
    })

    it('renders with custom title', () => {
      render(<Readlist {...defaultProps} title="React Fundamentals" />)
      
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    it('renders with custom author', () => {
      render(<Readlist {...defaultProps} author="jane_smith" />)
      
      expect(screen.getByText('jane_smith')).toBeInTheDocument()
    })

    it('renders with custom image', () => {
      render(<Readlist {...defaultProps} image="/custom-cover.jpg" />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image).toBeInTheDocument()
      expect(image.getAttribute('src')).toContain('custom-cover.jpg')
    })

    it('renders with custom id', () => {
      render(<Readlist {...defaultProps} id="custom-123" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/custom-123')
    })

    it('uses default title when title prop is not provided', () => {
      render(<Readlist {...defaultProps} title={undefined} />)
      
      expect(screen.getByText('Título da Readlist')).toBeInTheDocument()
    })

    it('uses default author when author prop is not provided', () => {
      render(<Readlist {...defaultProps} author={undefined} />)
      
      expect(screen.getByText('@AutorDaReadlist')).toBeInTheDocument()
    })

    it('uses default image when image prop is not provided', () => {
      render(<Readlist {...defaultProps} image={undefined} />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('Readlist.svg')
    })
  })

  describe('Link Functionality', () => {
    it('renders as a link component', () => {
      render(<Readlist {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })

    it('link has correct href with id', () => {
      render(<Readlist {...defaultProps} id="test-id-456" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/test-id-456')
    })

    it('link wraps entire component', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const link = container.querySelector('a')
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      const title = screen.getByText(defaultProps.title)
      const author = screen.getByText(defaultProps.author)
      
      expect(link).toContainElement(image)
      expect(link).toContainElement(title)
      expect(link).toContainElement(author)
    })

    it('link has correct CSS classes', () => {
      render(<Readlist {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('w-full items-center flex flex-col p-2 pb-4 hover:shadow-md transition-shadow rounded-lg')
    })
  })

  describe('Image Component', () => {
    it('renders Next.js Image component', () => {
      render(<Readlist {...defaultProps} />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image).toBeInTheDocument()
    })

    it('image src contains the image path', () => {
      render(<Readlist {...defaultProps} />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('javascript.jpg')
    })

    it('image has correct alt text format', () => {
      render(<Readlist {...defaultProps} title="My Custom Book" />)
      
      expect(screen.getByAltText('Capa da Readlist My Custom Book')).toBeInTheDocument()
    })

    it('image uses default when no image provided', () => {
      render(<Readlist id="123" title="Test" author="author" />)
      
      const image = screen.getByAltText('Capa da Readlist Test')
      expect(image.getAttribute('src')).toContain('Readlist.svg')
    })

    it('image has correct styling classes', () => {
      render(<Readlist {...defaultProps} />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image).toHaveClass('object-cover rounded-lg')
    })

    it('image container has correct aspect ratio', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const imageContainer = container.querySelector('.relative')
      expect(imageContainer).toHaveClass('aspect-[4/4]')
    })

    it('alt text uses title prop value directly', () => {
      render(<Readlist {...defaultProps} title={undefined} />)
      
      expect(screen.getByAltText('Capa da Readlist undefined')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('title uses h4 tag', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const heading = container.querySelector('h4')
      expect(heading).toBeInTheDocument()
      expect(heading?.textContent).toBe(defaultProps.title)
    })

    it('title has correct typography classes', () => {
      render(<Readlist {...defaultProps} />)
      
      const title = screen.getByText(defaultProps.title)
      expect(title).toHaveClass('text-h5')
      expect(title).toHaveClass('font-bold')
      expect(title).toHaveClass('truncate')
    })

    it('author uses p tag', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const author = container.querySelector('p')
      expect(author).toBeInTheDocument()
      expect(author?.textContent).toBe(defaultProps.author)
    })

    it('author has correct typography classes', () => {
      render(<Readlist {...defaultProps} />)
      
      const author = screen.getByText(defaultProps.author)
      expect(author).toHaveClass('text-b2')
      expect(author).toHaveClass('font-semibold')
      expect(author).toHaveClass('truncate')
    })

    it('text container has correct alignment classes', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const textContainer = container.querySelector('.text-center')
      expect(textContainer).toHaveClass('justify-center items-center pt-2 w-full')
    })

    it('has proper element nesting structure', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const link = container.querySelector('a')
      const imageContainer = link?.querySelector('.relative')
      const textContainer = link?.querySelector('.text-center')
      
      expect(link).toBeInTheDocument()
      expect(imageContainer).toBeInTheDocument()
      expect(textContainer).toBeInTheDocument()
    })
  })

  describe('Text Truncation', () => {
    it('truncates long titles', () => {
      const longTitle = 'This is a very long title that should be truncated when displayed'
      render(<Readlist {...defaultProps} title={longTitle} />)
      
      const title = screen.getByText(longTitle)
      expect(title).toHaveClass('truncate')
    })

    it('truncates long author names', () => {
      const longAuthor = 'very_long_author_username_that_should_truncate'
      render(<Readlist {...defaultProps} author={longAuthor} />)
      
      const author = screen.getByText(longAuthor)
      expect(author).toHaveClass('truncate')
    })
  })

  describe('Default Values', () => {
    it('displays all default values when no props provided', () => {
      render(<Readlist />)
      
      expect(screen.getByText('Título da Readlist')).toBeInTheDocument()
      expect(screen.getByText('@AutorDaReadlist')).toBeInTheDocument()
      
      const image = screen.getByAltText('Capa da Readlist undefined')
      expect(image.getAttribute('src')).toContain('Readlist.svg')
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/undefined')
    })

    it('empty string title shows default', () => {
      render(<Readlist {...defaultProps} title="" />)
      
      expect(screen.getByText('Título da Readlist')).toBeInTheDocument()
    })

    it('empty string author shows default', () => {
      render(<Readlist {...defaultProps} author="" />)
      
      expect(screen.getByText('@AutorDaReadlist')).toBeInTheDocument()
    })

    it('empty string image shows default', () => {
      render(<Readlist {...defaultProps} image="" />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('Readlist.svg')
    })

    it('null values show defaults', () => {
      render(<Readlist id={null as any} title={null as any} author={null as any} image={null as any} />)
      
      expect(screen.getByText('Título da Readlist')).toBeInTheDocument()
      expect(screen.getByText('@AutorDaReadlist')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles unicode/emoji in title', () => {
      const emojiTitle = 'JavaScript ✨ Guide 🚀'
      render(<Readlist {...defaultProps} title={emojiTitle} />)
      
      expect(screen.getByText(emojiTitle)).toBeInTheDocument()
    })

    it('handles unicode/emoji in author', () => {
      const emojiAuthor = 'user_name_✨'
      render(<Readlist {...defaultProps} author={emojiAuthor} />)
      
      expect(screen.getByText(emojiAuthor)).toBeInTheDocument()
    })

    it('handles very long id', () => {
      const longId = 'a'.repeat(100)
      render(<Readlist {...defaultProps} id={longId} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', `/readlist/${longId}`)
    })

    it('handles special characters in id', () => {
      render(<Readlist {...defaultProps} id="id-with-dashes_and_underscores" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/id-with-dashes_and_underscores')
    })

    it('handles numeric id', () => {
      render(<Readlist {...defaultProps} id={12345 as any} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/12345')
    })

    it('handles path-like strings in image', () => {
      render(<Readlist {...defaultProps} image="/path/to/image.jpg" />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('image.jpg')
    })

    it('handles URL in image', () => {
      render(<Readlist {...defaultProps} image="https://example.com/image.jpg" />)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('example.com')
    })
  })

  describe('Integration', () => {
    it('renders complete readlist card structure', () => {
      render(<Readlist {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/readlist/${defaultProps.id}`)
      
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image).toBeInTheDocument()
      
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      expect(screen.getByText(defaultProps.author)).toBeInTheDocument()
    })

    it('all elements are properly nested', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const link = container.querySelector('a')
      const image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      const title = screen.getByText(defaultProps.title)
      const author = screen.getByText(defaultProps.author)
      
      expect(link).toContainElement(image)
      expect(link).toContainElement(title)
      expect(link).toContainElement(author)
    })

    it('maintains responsive design classes', () => {
      const { container } = render(<Readlist {...defaultProps} />)
      
      const link = container.querySelector('a')
      const imageContainer = container.querySelector('.relative')
      const textContainer = container.querySelector('.text-center')
      
      expect(link).toHaveClass('w-full')
      expect(imageContainer).toHaveClass('w-full')
      expect(textContainer).toHaveClass('w-full')
    })
  })

  describe('Prop Updates', () => {
    it('updates title when prop changes', () => {
      const { rerender } = render(<Readlist {...defaultProps} title="Original" />)
      expect(screen.getByText('Original')).toBeInTheDocument()
      
      rerender(<Readlist {...defaultProps} title="Updated" />)
      expect(screen.getByText('Updated')).toBeInTheDocument()
      expect(screen.queryByText('Original')).not.toBeInTheDocument()
    })

    it('updates author when prop changes', () => {
      const { rerender } = render(<Readlist {...defaultProps} author="user1" />)
      expect(screen.getByText('user1')).toBeInTheDocument()
      
      rerender(<Readlist {...defaultProps} author="user2" />)
      expect(screen.getByText('user2')).toBeInTheDocument()
      expect(screen.queryByText('user1')).not.toBeInTheDocument()
    })

    it('updates image when prop changes', () => {
      const { rerender } = render(<Readlist {...defaultProps} image="/img1.jpg" />)
      let image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('img1.jpg')
      
      rerender(<Readlist {...defaultProps} image="/img2.jpg" />)
      image = screen.getByAltText(`Capa da Readlist ${defaultProps.title}`)
      expect(image.getAttribute('src')).toContain('img2.jpg')
    })

    it('updates link href when id changes', () => {
      const { rerender } = render(<Readlist {...defaultProps} id="id1" />)
      let link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/id1')
      
      rerender(<Readlist {...defaultProps} id="id2" />)
      link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/readlist/id2')
    })
  })
})