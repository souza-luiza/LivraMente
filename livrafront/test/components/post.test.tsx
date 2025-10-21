import { render, screen } from '@testing-library/react'
import Post from '../../src/components/post'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ 
    children, 
    href, 
    className,
    ...props 
  }: { 
    children: React.ReactNode; 
    href: string;
    className?: string;
    [key: string]: any;
  }) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    )
  }
})

// Mock Button component
jest.mock('../../src/components/button', () => {
  return function MockButton({ text, icon, colorScheme, size }: { 
    text: string; 
    icon: React.ReactNode; 
    colorScheme: string; 
    size: string 
  }) {
    return (
      <button 
        data-text={text}
        data-colorscheme={colorScheme}
        data-size={size}
      >
        {icon}
        {text}
      </button>
    )
  }
})

// Mock Icon components
jest.mock('../../src/components/icons/CodeIcon', () => {
  return function MockCodeIcon({ size }: { size?: number }) {
    return <span data-testid="code-icon" data-size={size}>📝</span>
  }
})

jest.mock('../../src/components/icons/CommentIcon', () => {
  return function MockCommentIcon() {
    return <span data-testid="comment-icon">💬</span>
  }
})

jest.mock('../../src/components/icons/HeartIcon', () => {
  return function MockHeartIcon() {
    return <span data-testid="heart-icon">❤️</span>
  }
})

describe('Post Component', () => {
  const defaultProps = {
    id: 'post-123',
    community: 'Tech Community',
    author: 'john_doe',
    content: 'This is a test post content',
    commentsCount: 5,
    likesCount: 10,
  }

  describe('Rendering and Props', () => {
    it('renders without crashing', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders as a Link component', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })

    it('renders community name', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByText('Tech Community')).toBeInTheDocument()
    })

    it('renders author with @ prefix', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByText('@john_doe')).toBeInTheDocument()
    })

    it('renders post content', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByText('This is a test post content')).toBeInTheDocument()
    })

    it('renders CodeIcon', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByTestId('code-icon')).toBeInTheDocument()
    })

    it('CodeIcon has correct size', () => {
      render(<Post {...defaultProps} />)
      
      const icon = screen.getByTestId('code-icon')
      expect(icon).toHaveAttribute('data-size', '24')
    })

    it('renders CommentIcon', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByTestId('comment-icon')).toBeInTheDocument()
    })

    it('renders HeartIcon', () => {
      render(<Post {...defaultProps} />)

      expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    })

    it('renders "Ver mais..." link', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByText('Ver mais...')).toBeInTheDocument()
    })
  })

  describe('Link Functionality', () => {
    it('has correct href format', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/john_doe/posts/post-123')
    })

    it('href includes author and id', () => {
      render(<Post {...defaultProps} author="alice" id="456" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/alice/posts/456')
    })

    it('handles undefined author in href', () => {
      render(<Post {...defaultProps} author={undefined} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/undefined/posts/post-123')
    })

    it('handles undefined id in href', () => {
      render(<Post {...defaultProps} id={undefined} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/john_doe/posts/undefined')
    })

    it('has correct styling classes', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('flex flex-col h-[220px] justify-between')
    })

    it('has hover effect classes', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('hover:shadow-lg transition-shadow')
    })
  })

  describe('Button Components', () => {
    it('renders comment button with correct count', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const commentButton = buttons[0]
      
      expect(commentButton).toHaveAttribute('data-text', '5')
    })

    it('renders like button with correct count', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const likeButton = buttons[1]
      
      expect(likeButton).toHaveAttribute('data-text', '10')
    })

    it('both buttons have dark-green color scheme', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('data-colorscheme', 'dark-green')
      })
    })

    it('both buttons have small size', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('data-size', 'small')
      })
    })

    it('comment button displays 0 when count is undefined', () => {
      render(<Post {...defaultProps} commentsCount={undefined} />)
      
      const buttons = screen.getAllByRole('button')
      const commentButton = buttons[0]
      
      expect(commentButton).toHaveAttribute('data-text', '0')
    })

    it('like button displays 0 when count is undefined', () => {
      render(<Post {...defaultProps} likesCount={undefined} />)
      
      const buttons = screen.getAllByRole('button')
      const likeButton = buttons[1]
      
      expect(likeButton).toHaveAttribute('data-text', '0')
    })

    it('comment button displays 0 when count is 0', () => {
      render(<Post {...defaultProps} commentsCount={0} />)
      
      const buttons = screen.getAllByRole('button')
      const commentButton = buttons[0]
      
      expect(commentButton).toHaveAttribute('data-text', '0')
    })

    it('like button displays 0 when count is 0', () => {
      render(<Post {...defaultProps} likesCount={0} />)
      
      const buttons = screen.getAllByRole('button')
      const likeButton = buttons[1]
      
      expect(likeButton).toHaveAttribute('data-text', '0')
    })
  })

  describe('Layout and Styling', () => {
    it('has fixed height of 220px', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('h-[220px]')
    })

    it('has white background', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-white')
    })

    it('has rounded corners', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('rounded-lg')
    })

    it('has border styling', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('border-2 border-b-lime-950')
    })

    it('has padding', () => {
      render(<Post {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('p-4')
    })

    it('header section has correct flex classes', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const header = container.querySelector('.flex.gap-2.mb-2')
      expect(header).toBeInTheDocument()
    })

    it('content section has overflow hidden', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const contentSection = container.querySelector('.mb-3.flex-1.overflow-hidden')
      expect(contentSection).toBeInTheDocument()
    })

    it('buttons container has flex with gap', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const buttonsContainer = container.querySelector('.flex.gap-2')
      expect(buttonsContainer).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('renders multiline content with whitespace-pre-line', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3'
      const { container } = render(<Post {...defaultProps} content={multilineContent} />)
      
      const paragraph = container.querySelector('.whitespace-pre-line')
      expect(paragraph).toBeInTheDocument()
      expect(paragraph).toHaveClass('whitespace-pre-line')
    })

    it('content has line-clamp-4 class', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveClass('line-clamp-4')
    })

    it('content has text-b2 typography', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveClass('text-b2')
    })

    it('renders empty content when content is undefined', () => {
      const { container } = render(<Post {...defaultProps} content={undefined} />)
      
      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveTextContent('')
    })

    it('renders empty community when community is undefined', () => {
      render(<Post {...defaultProps} community={undefined} />)
      
      const headers = screen.getAllByRole('heading', { level: 6 })
      expect(headers[0]).toHaveTextContent('')
    })

    it('renders @ symbol even when author is undefined', () => {
      render(<Post {...defaultProps} author={undefined} />)
      
      expect(screen.getByText(/@/)).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('community uses h6 heading', () => {
      render(<Post {...defaultProps} />)
      
      const headings = screen.getAllByRole('heading', { level: 6 })
      expect(headings[0]).toHaveTextContent('Tech Community')
    })

    it('author uses h6 heading', () => {
      render(<Post {...defaultProps} />)
      
      const headings = screen.getAllByRole('heading', { level: 6 })
      expect(headings[1]).toHaveTextContent('@john_doe')
    })

    it('community has text-h6 class', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const headings = container.querySelectorAll('h6')
      expect(headings[0]).toHaveClass('text-h6')
    })

    it('author has text-h6 class', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const headings = container.querySelectorAll('h6')
      expect(headings[1]).toHaveClass('text-h6')
    })

    it('"Ver mais..." has font-semibold class', () => {
      render(<Post {...defaultProps} />)
      
      const verMais = screen.getByText('Ver mais...')
      expect(verMais).toHaveClass('font-semibold')
    })

    it('"Ver mais..." has hover:underline class', () => {
      render(<Post {...defaultProps} />)
      
      const verMais = screen.getByText('Ver mais...')
      expect(verMais).toHaveClass('hover:underline')
    })

    it('"Ver mais..." has primary color class', () => {
      render(<Post {...defaultProps} />)
      
      const verMais = screen.getByText('Ver mais...')
      expect(verMais).toHaveClass('text-[var(--primary-700)]')
    })
  })

  describe('Edge Cases', () => {
    it('handles all props as undefined', () => {
      const { container } = render(<Post />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles empty strings for all props', () => {
      render(
        <Post 
          id="" 
          community="" 
          author="" 
          content="" 
          commentsCount={0} 
          likesCount={0} 
        />
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '//posts/')
    })

    it('handles very long content', () => {
      const longContent = 'A'.repeat(1000)
      render(<Post {...defaultProps} content={longContent} />)
      
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles very long community name', () => {
      const longCommunity = 'A'.repeat(100)
      render(<Post {...defaultProps} community={longCommunity} />)
      
      expect(screen.getByText(longCommunity)).toBeInTheDocument()
    })

    it('handles very long author name', () => {
      const longAuthor = 'a'.repeat(100)
      render(<Post {...defaultProps} author={longAuthor} />)
      
      expect(screen.getByText(`@${longAuthor}`)).toBeInTheDocument()
    })

    it('handles large comment count', () => {
      render(<Post {...defaultProps} commentsCount={9999} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('data-text', '9999')
    })

    it('handles large like count', () => {
      render(<Post {...defaultProps} likesCount={9999} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons[1]).toHaveAttribute('data-text', '9999')
    })

    it('handles negative comment count', () => {
      render(<Post {...defaultProps} commentsCount={-5} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('data-text', '-5')
    })

    it('handles special characters in content', () => {
      const specialContent = '<script>alert("xss")</script>'
      render(<Post {...defaultProps} content={specialContent} />)
      
      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('handles unicode characters in content', () => {
      const unicodeContent = '🎉 Hello 世界 ñ é ü'
      render(<Post {...defaultProps} content={unicodeContent} />)
      
      expect(screen.getByText(unicodeContent)).toBeInTheDocument()
    })

    it('handles special characters in author', () => {
      render(<Post {...defaultProps} author="user_123-test" />)
      
      expect(screen.getByText('@user_123-test')).toBeInTheDocument()
    })

    it('handles special characters in community', () => {
      render(<Post {...defaultProps} community="Tech & Design" />)
      
      expect(screen.getByText('Tech & Design')).toBeInTheDocument()
    })
  })

  describe('Structure and Elements', () => {
    it('renders exactly 3 main sections', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const link = container.querySelector('a')
      const sections = link?.children
      
      expect(sections?.length).toBe(3)
    })

    it('renders exactly 2 h6 headings', () => {
      render(<Post {...defaultProps} />)
      
      const headings = screen.getAllByRole('heading', { level: 6 })
      expect(headings).toHaveLength(2)
    })

    it('renders exactly 2 buttons', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('renders exactly 1 paragraph', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const paragraphs = container.querySelectorAll('p')
      expect(paragraphs).toHaveLength(1)
    })

    it('CodeIcon is between community and author', () => {
      const { container } = render(<Post {...defaultProps} />)
      
      const header = container.querySelector('.flex.gap-2.mb-2')
      const children = header?.children
      
      expect(children?.[0].tagName).toBe('H6')
      expect(children?.[1].getAttribute('data-testid')).toBe('code-icon')
      expect(children?.[2].tagName).toBe('H6')
    })

    it('comment button comes before like button', () => {
      render(<Post {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      
      expect(buttons[0]).toContainElement(screen.getByTestId('comment-icon'))
      expect(buttons[1]).toContainElement(screen.getByTestId('heart-icon'))
    })
  })

  describe('Props Validation', () => {
    it('converts number counts to strings', () => {
      render(<Post {...defaultProps} commentsCount={42} likesCount={100} />)
      
      const buttons = screen.getAllByRole('button')
      
      expect(buttons[0]).toHaveAttribute('data-text', '42')
      expect(buttons[1]).toHaveAttribute('data-text', '100')
    })

    it('handles 0 as a valid count', () => {
      render(<Post {...defaultProps} commentsCount={0} likesCount={0} />)
      
      const buttons = screen.getAllByRole('button')
      
      expect(buttons[0]).toHaveAttribute('data-text', '0')
      expect(buttons[1]).toHaveAttribute('data-text', '0')
    })

    it('id can be numeric string', () => {
      render(<Post {...defaultProps} id="12345" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/john_doe/posts/12345')
    })

    it('id can be alphanumeric', () => {
      render(<Post {...defaultProps} id="post_abc_123" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/john_doe/posts/post_abc_123')
    })
  })

  describe('Integration', () => {
    it('renders complete post with all elements', () => {
      render(<Post {...defaultProps} />)
      
      expect(screen.getByRole('link')).toBeInTheDocument()
      expect(screen.getByText('Tech Community')).toBeInTheDocument()
      expect(screen.getByText('@john_doe')).toBeInTheDocument()
      expect(screen.getByText('This is a test post content')).toBeInTheDocument()
      expect(screen.getByTestId('code-icon')).toBeInTheDocument()
      expect(screen.getByTestId('comment-icon')).toBeInTheDocument()
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('maintains structure when props change', () => {
      const { rerender } = render(<Post {...defaultProps} />)
      
      const initialButtons = screen.getAllByRole('button')
      expect(initialButtons).toHaveLength(2)
      
      rerender(<Post {...defaultProps} commentsCount={20} likesCount={30} />)
      
      const updatedButtons = screen.getAllByRole('button')
      expect(updatedButtons).toHaveLength(2)
    })

    it('updates content on rerender', () => {
      const { rerender } = render(<Post {...defaultProps} content="Initial content" />)
      
      expect(screen.getByText('Initial content')).toBeInTheDocument()
      
      rerender(<Post {...defaultProps} content="Updated content" />)
      
      expect(screen.getByText('Updated content')).toBeInTheDocument()
      expect(screen.queryByText('Initial content')).not.toBeInTheDocument()
    })

    it('updates href on author/id change', () => {
      const { rerender } = render(<Post {...defaultProps} author="alice" id="1" />)
      
      let link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/alice/posts/1')
      
      rerender(<Post {...defaultProps} author="bob" id="2" />)
      
      link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/bob/posts/2')
    })
  })
})