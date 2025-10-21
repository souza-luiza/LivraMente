import { render, screen } from '@testing-library/react'
import ProfilePosts from '@/components/profile-posts'

// Mock Post component
jest.mock('@/components/post', () => {
  return function MockPost({ id, community, author, content, commentsCount, likesCount }: {
    id: string
    community: string
    author: string
    content: string
    commentsCount: number
    likesCount: number
  }) {
    return (
      <div 
        data-testid={`post-${id}`}
        data-community={community}
        data-author={author}
        data-comments={commentsCount}
        data-likes={likesCount}
      >
        <p>{content}</p>
      </div>
    )
  }
})

describe('ProfilePosts Component', () => {
  const defaultUsername = 'testuser'

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders grid container', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('grid has correct classes', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('w-full grid grid-cols-1 gap-4 relative')
    })
  })

  describe('Posts Data', () => {
    it('renders exactly 2 posts', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      expect(screen.getByTestId('post-1')).toBeInTheDocument()
      expect(screen.getByTestId('post-2')).toBeInTheDocument()
    })

    it('first post has correct data', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-community', 'Jogos Vorazes')
      expect(post1).toHaveAttribute('data-author', defaultUsername)
      expect(post1).toHaveAttribute('data-comments', '5')
      expect(post1).toHaveAttribute('data-likes', '10')
    })

    it('second post has correct data', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post2 = screen.getByTestId('post-2')
      expect(post2).toHaveAttribute('data-community', 'O Gato Crítico')
      expect(post2).toHaveAttribute('data-author', defaultUsername)
      expect(post2).toHaveAttribute('data-comments', '5')
      expect(post2).toHaveAttribute('data-likes', '10')
    })

    it('first post contains Lorem Ipsum content', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveTextContent('Lorem Ipsum is simply dummy text')
    })

    it('second post contains cat sounds content', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post2 = screen.getByTestId('post-2')
      expect(post2).toHaveTextContent('MIAU MIAU MIAU')
    })

    it('posts have different IDs', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = container.querySelector('[data-testid="post-1"]')
      const post2 = container.querySelector('[data-testid="post-2"]')
      
      expect(post1).toBeInTheDocument()
      expect(post2).toBeInTheDocument()
    })

    it('both posts have same comment count', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      expect(post1).toHaveAttribute('data-comments', '5')
      expect(post2).toHaveAttribute('data-comments', '5')
    })

    it('both posts have same likes count', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      expect(post1).toHaveAttribute('data-likes', '10')
      expect(post2).toHaveAttribute('data-likes', '10')
    })
  })

  describe('Username Prop', () => {
    it('passes username to all posts', () => {
      render(<ProfilePosts username="john_doe" />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      expect(post1).toHaveAttribute('data-author', 'john_doe')
      expect(post2).toHaveAttribute('data-author', 'john_doe')
    })

    it('handles different usernames', () => {
      const { rerender } = render(<ProfilePosts username="user1" />)
      
      let post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'user1')
      
      rerender(<ProfilePosts username="user2" />)
      post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'user2')
    })

    it('handles username with special characters', () => {
      render(<ProfilePosts username="user_123-test" />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'user_123-test')
    })

    it('handles empty username', () => {
      render(<ProfilePosts username="" />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', '')
    })
  })

  describe('Layout Structure', () => {
    it('uses single column grid', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument()
    })

    it('has gap between posts', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.gap-4')
      expect(grid).toBeInTheDocument()
    })

    it('container is full width', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.w-full')
      expect(grid).toBeInTheDocument()
    })

    it('container is positioned relative', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.relative')
      expect(grid).toBeInTheDocument()
    })

    it('posts are direct children of grid', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid')
      const children = grid?.children
      
      expect(children?.length).toBe(2)
    })
  })

  describe('Post Components', () => {
    it('passes all required props to Post components', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      
      expect(post1).toHaveAttribute('data-community')
      expect(post1).toHaveAttribute('data-author')
      expect(post1).toHaveAttribute('data-comments')
      expect(post1).toHaveAttribute('data-likes')
    })

    it('each post has unique key', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const posts = container.querySelectorAll('[data-testid^="post-"]')
      const ids = Array.from(posts).map(post => post.getAttribute('data-testid'))
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(2)
    })

    it('renders posts in correct order', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid')
      const firstChild = grid?.children[0]
      const secondChild = grid?.children[1]
      
      expect(firstChild?.getAttribute('data-testid')).toBe('post-1')
      expect(secondChild?.getAttribute('data-testid')).toBe('post-2')
    })
  })

  describe('Content Validation', () => {
    it('first post content contains multiple paragraphs', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const content = post1.textContent
      
      expect(content).toContain('Lorem Ipsum is simply dummy text')
      expect(content?.split('\n\n').length).toBeGreaterThan(1)
    })

    it('second post content is cat sounds', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post2 = screen.getByTestId('post-2')
      
      expect(post2).toHaveTextContent(/MIAU.*meow.*mi.*aaaaaau/i)
    })

    it('posts have different communities', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      const community1 = post1.getAttribute('data-community')
      const community2 = post2.getAttribute('data-community')
      
      expect(community1).not.toBe(community2)
    })

    it('first post community is Jogos Vorazes', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-community', 'Jogos Vorazes')
    })

    it('second post community is O Gato Crítico', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post2 = screen.getByTestId('post-2')
      expect(post2).toHaveAttribute('data-community', 'O Gato Crítico')
    })
  })

  describe('Static Data', () => {
    it('uses hardcoded posts array', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const posts = screen.getAllByTestId(/^post-/)
      expect(posts).toHaveLength(2)
    })

    it('comment counts are always 5', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      expect(post1).toHaveAttribute('data-comments', '5')
      expect(post2).toHaveAttribute('data-comments', '5')
    })

    it('like counts are always 10', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      const post2 = screen.getByTestId('post-2')
      
      expect(post1).toHaveAttribute('data-likes', '10')
      expect(post2).toHaveAttribute('data-likes', '10')
    })

    it('post IDs are sequential strings', () => {
      render(<ProfilePosts username={defaultUsername} />)
      
      expect(screen.getByTestId('post-1')).toBeInTheDocument()
      expect(screen.getByTestId('post-2')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('renders complete posts grid', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      
      expect(screen.getByTestId('post-1')).toBeInTheDocument()
      expect(screen.getByTestId('post-2')).toBeInTheDocument()
    })

    it('maintains consistent structure across re-renders', () => {
      const { rerender, container } = render(<ProfilePosts username="user1" />)
      
      const initialGrid = container.querySelector('.grid')
      const initialClasses = initialGrid?.className
      
      rerender(<ProfilePosts username="user2" />)
      
      const updatedGrid = container.querySelector('.grid')
      expect(updatedGrid?.className).toBe(initialClasses)
    })

    it('updates author on username change', () => {
      const { rerender } = render(<ProfilePosts username="alice" />)
      
      let post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'alice')
      
      rerender(<ProfilePosts username="bob" />)
      post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'bob')
    })

    it('all posts receive same username', () => {
      render(<ProfilePosts username="shared_user" />)
      
      const posts = screen.getAllByTestId(/^post-/)
      
      posts.forEach(post => {
        expect(post).toHaveAttribute('data-author', 'shared_user')
      })
    })
  })

  describe('Responsive Design', () => {
    it('grid is responsive with full width', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.w-full')
      expect(grid).toBeInTheDocument()
    })

    it('uses single column on all screen sizes', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument()
    })

    it('maintains consistent spacing', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grid = container.querySelector('.gap-4')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles long usernames', () => {
      const longUsername = 'a'.repeat(50)
      render(<ProfilePosts username={longUsername} />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', longUsername)
    })

    it('handles username with spaces', () => {
      render(<ProfilePosts username="user name with spaces" />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'user name with spaces')
    })

    it('handles unicode in username', () => {
      render(<ProfilePosts username="user_✨_emoji" />)
      
      const post1 = screen.getByTestId('post-1')
      expect(post1).toHaveAttribute('data-author', 'user_✨_emoji')
    })

    it('renders consistently with different usernames', () => {
      const { rerender, container } = render(<ProfilePosts username="user1" />)
      
      const posts1 = container.querySelectorAll('[data-testid^="post-"]')
      
      rerender(<ProfilePosts username="user2" />)
      
      const posts2 = container.querySelectorAll('[data-testid^="post-"]')
      expect(posts1.length).toBe(posts2.length)
    })
  })

  describe('Performance', () => {
    it('renders efficiently without errors', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('does not create duplicate elements', () => {
      const { container } = render(<ProfilePosts username={defaultUsername} />)
      
      const grids = container.querySelectorAll('.grid')
      expect(grids).toHaveLength(1)
    })

    it('maintains stable DOM structure', () => {
      const { container, rerender } = render(<ProfilePosts username="user1" />)
      
      const initialChildren = container.firstChild?.childNodes.length
      
      rerender(<ProfilePosts username="user2" />)
      
      const updatedChildren = container.firstChild?.childNodes.length
      expect(updatedChildren).toBe(initialChildren)
    })
  })
})