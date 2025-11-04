import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import UserProfilePage from '@/app/[username]/page'
import { notFound } from 'next/navigation'

// Mock next/navigation
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}))

// Mock next/link so clicks call router.push (helps test navigation)
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    const { useRouter } = require('next/navigation')
    const router = useRouter()
    return (
      <a href={href} onClick={(e) => { e.preventDefault(); router.push(href); }} {...props}>
        {children}
      </a>
    )
  }
})

// Mock components
jest.mock('@/components/sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/components/button', () => {
  return function MockButton({ text, icon }: { text: string; icon?: React.ReactNode }) {
    return (
      <button data-testid="edit-button">
        {icon}
        {text}
      </button>
    )
  }
})

jest.mock('@/components/profile-icon', () => {
  return function MockProfileIcon({ size, percentage, className }: { size: number; percentage: number; className: string }) {
    return (
      <div data-testid="profile-icon" data-size={size} data-percentage={percentage} className={className}>
        Profile Icon
      </div>
    )
  }
})

jest.mock('@/components/profile-badge', () => {
  return function MockProfileBadge({ content, width, height }: { content: number; width: number; height: number }) {
    return (
      <div data-testid="profile-badge" data-content={content} data-width={width} data-height={height}>
        Badge {content}
      </div>
    )
  }
})

jest.mock('@/components/profile-readlists', () => {
  return function MockProfileReadlists() {
    return <div data-testid="profile-readlists">Profile Readlists</div>
  }
})

jest.mock('@/components/profile-posts', () => {
  return function MockProfilePosts({ username }: { username: string }) {
    return <div data-testid="profile-posts" data-username={username}>Profile Posts</div>
  }
})

jest.mock('@/components/icons/EditIcon', () => {
  return function MockEditIcon() {
    return <span data-testid="edit-icon">Edit Icon</span>
  }
})

jest.mock('@/components/icons/ChevronRightIcon', () => {
  return function MockChevronRightIcon({ width, height }: { width: number; height: number }) {
    return <span data-testid="chevron-right-icon" data-width={width} data-height={height}>→</span>
  }
})

describe('UserProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page with username', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('@john_doe')).toBeInTheDocument()
      })
    })

    it('renders sidebar component', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      })
    })

    it('renders main container with correct layout', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const main = container.querySelector('main')
        expect(main).toHaveClass('flex-1 flex flex-col items-center p-4')
      })
    })

    it('renders with correct background color', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const wrapper = container.querySelector('.min-h-screen')
        expect(wrapper).toHaveClass('bg-[#E5EEDF]')
      })
    })
  })

  describe('Profile Information', () => {
    it('displays user pronouns', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('ele/dele')).toBeInTheDocument()
      })
    })

    it('displays username with @ symbol', async () => {
      const params = Promise.resolve({ username: 'jane_smith' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('@jane_smith')).toBeInTheDocument()
      })
    })

    it('username has correct typography classes', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const username = screen.getByText('@john_doe')
        expect(username).toHaveClass('text-3xl font-bold pb-2 text-h5')
      })
    })

    it('pronouns have correct typography classes', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const pronouns = screen.getByText('ele/dele')
        expect(pronouns).toHaveClass('pb-4 text-b1 body-quotation')
      })
    })
  })

  describe('Profile Icon and Badge', () => {
    it('renders profile icon with correct size', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveAttribute('data-size', '190')
      })
    })

    it('renders profile icon with correct percentage', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveAttribute('data-percentage', '67')
      })
    })

    it('renders profile icon with correct color class', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveClass('text-[var(--success-700)]')
      })
    })

    it('renders profile badge with correct level', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const badge = screen.getByTestId('profile-badge')
        expect(badge).toHaveAttribute('data-content', '15')
      })
    })

    it('renders profile badge with correct dimensions', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const badge = screen.getByTestId('profile-badge')
        expect(badge).toHaveAttribute('data-width', '60')
        expect(badge).toHaveAttribute('data-height', '30')
      })
    })

    it('profile icon container has correct size', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const iconContainer = container.querySelector('.w-48.h-48')
        expect(iconContainer).toBeInTheDocument()
        expect(iconContainer).toHaveClass('mb-4 relative')
      })
    })

    it('badge is positioned correctly relative to icon', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const badgeWrapper = container.querySelector('.absolute.top-0.right-0')
        expect(badgeWrapper).toHaveClass('-translate-y-0 translate-x-12')
      })
    })
  })

  describe('Edit Profile Button', () => {
    it('renders edit profile button', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument()
      })
    })

    it('edit button has correct text', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
      })
    })

    it('edit button has edit icon', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
      })
    })

    it('edit button navigates to edit profile', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const editButton = screen.getByText('Editar Perfil')
        expect(editButton).toBeInTheDocument()
      })
    })
  })

  describe('Readlists Section', () => {
    it('renders readlists section', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-readlists')).toBeInTheDocument()
      })
    })

    it('readlists section has correct heading', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('Readlists')).toBeInTheDocument()
      })
    })

    it('readlists heading has Chevron icon', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icons = screen.getAllByTestId('chevron-right-icon')
        expect(icons[0]).toBeInTheDocument()
        expect(icons[0]).toHaveAttribute('data-width', '24')
        expect(icons[0]).toHaveAttribute('data-height', '24')
      })
    })

    it('readlists link has correct href', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/john_doe/readlists"]')
        expect(link).toBeInTheDocument()
      })
    })

    it('readlists heading has correct classes', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/john_doe/readlists"]')
        expect(link).toHaveClass('text-h4 body-underline flex items-center gap-2 pb-4')
      })
    })

    it('readlists section is in white container', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.bg-white.rounded-lg')
        expect(sections[0]).toBeInTheDocument()
      })
    })

    it('readlists container has correct width', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.w-1\\/2')
        expect(sections[0]).toHaveClass('bg-white rounded-lg p-4 my-4 flex flex-col')
      })
    })

    it('readlists content area has overflow scroll', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const scrollArea = container.querySelector('.overflow-y-auto')
        expect(scrollArea).toBeInTheDocument()
      })
    })

    it('navigates to readlists page when clicking the Readlists link', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))

      await waitFor(() => {
        const link = container.querySelector('a[href="/john_doe/readlists"]')
        expect(link).toBeInTheDocument()
        // click the link
        fireEvent.click(link!)
        expect(mockPush).toHaveBeenCalledWith('/john_doe/readlists')
      })
    })
  })

  describe('Posts Section', () => {
    it('renders posts section', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-posts')).toBeInTheDocument()
      })
    })

    it('posts section receives username prop', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const posts = screen.getByTestId('profile-posts')
        expect(posts).toHaveAttribute('data-username', 'john_doe')
      })
    })

    it('posts section has correct heading', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('Postagens')).toBeInTheDocument()
      })
    })

    it('posts heading has Chevron icon', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icons = screen.getAllByTestId('chevron-right-icon')
        expect(icons[1]).toBeInTheDocument()
      })
    })

    it('posts link has correct href', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/john_doe/posts"]')
        expect(link).toBeInTheDocument()
      })
    })

    it('posts section is in white container', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.bg-white.rounded-lg')
        expect(sections[1]).toBeInTheDocument()
      })
    })

    it('posts container has correct width', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.w-1\\/2')
        expect(sections[1]).toHaveClass('bg-white rounded-lg p-4 my-4 flex flex-col')
      })
    })
  })

  describe('Layout', () => {
    it('renders two-column layout for readlists and posts', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const layoutContainer = container.querySelector('.w-full.flex.justify-center')
        expect(layoutContainer).toHaveClass('items-stretch mt-8 gap-4')
      })
    })

    it('both sections have equal width', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.w-1\\/2')
        expect(sections).toHaveLength(2)
      })
    })

    it('sections have gap between them', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const layoutContainer = container.querySelector('.gap-4')
        expect(layoutContainer).toBeInTheDocument()
      })
    })

    it('both sections are flex columns', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.flex.flex-col')
        expect(sections.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('calls notFound when username is empty', async () => {
      const params = Promise.resolve({ username: '' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(notFound).toHaveBeenCalled()
      })
    })

    it('does not call notFound when username is provided', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(notFound).not.toHaveBeenCalled()
      })
    })
  })

  describe('User Profile Data', () => {
    it('uses static user profile data', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByText('ele/dele')).toBeInTheDocument()
        const badge = screen.getByTestId('profile-badge')
        expect(badge).toHaveAttribute('data-content', '15')
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveAttribute('data-percentage', '67')
      })
    })

    it('profile level is 15', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const badge = screen.getByTestId('profile-badge')
        expect(badge).toHaveAttribute('data-content', '15')
      })
    })

    it('profile percentage is 67', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveAttribute('data-percentage', '67')
      })
    })
  })

  describe('Navigation Links', () => {
    it('has two navigation links (readlists and posts)', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const links = container.querySelectorAll('a')
        expect(links.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('readlists link includes username', async () => {
      const params = Promise.resolve({ username: 'jane_smith' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/jane_smith/readlists"]')
        expect(link).toBeInTheDocument()
      })
    })

    it('posts link includes username', async () => {
      const params = Promise.resolve({ username: 'jane_smith' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/jane_smith/posts"]')
        expect(link).toBeInTheDocument()
      })
    })

    it('readlists link includes username', async () => {
      const params = Promise.resolve({ username: 'jane_smith' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/jane_smith/readlists"]')
        expect(link).toBeInTheDocument()
      })
    })

    it('posts link includes username', async () => {
      const params = Promise.resolve({ username: 'jane_smith' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const link = container.querySelector('a[href="/jane_smith/posts"]')
        expect(link).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('main container is responsive', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const main = container.querySelector('main')
        expect(main).toHaveClass('flex-1')
      })
    })

    it('layout container uses full width', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const layoutContainer = container.querySelector('.w-full.flex')
        expect(layoutContainer).toBeInTheDocument()
      })
    })

    it('sections stretch to fill height', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const layoutContainer = container.querySelector('.items-stretch')
        expect(layoutContainer).toBeInTheDocument()
      })
    })
  })

  describe('Content Sections', () => {
    it('each section has padding', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.p-4')
        expect(sections.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('each section has vertical margin', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.my-4')
        expect(sections.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('each section has rounded corners', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const sections = container.querySelectorAll('.rounded-lg')
        expect(sections.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('content areas use flex-1 for equal height', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      const { container } = render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const flexAreas = container.querySelectorAll('.flex-1')
        expect(flexAreas.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Integration', () => {
    it('renders complete profile page structure', async () => {
      const params = Promise.resolve({ username: 'john_doe' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.getByText('@john_doe')).toBeInTheDocument()
        expect(screen.getByTestId('profile-icon')).toBeInTheDocument()
        expect(screen.getByTestId('profile-badge')).toBeInTheDocument()
        expect(screen.getByTestId('edit-button')).toBeInTheDocument()
        expect(screen.getByTestId('profile-readlists')).toBeInTheDocument()
        expect(screen.getByTestId('profile-posts')).toBeInTheDocument()
      })
    })

    it('all components receive correct props', async () => {
      const params = Promise.resolve({ username: 'test_user' })
      
      render(await UserProfilePage({ params }))
      
      await waitFor(() => {
        const icon = screen.getByTestId('profile-icon')
        expect(icon).toHaveAttribute('data-size', '190')
        expect(icon).toHaveAttribute('data-percentage', '67')
        
        const badge = screen.getByTestId('profile-badge')
        expect(badge).toHaveAttribute('data-content', '15')
        
        const posts = screen.getByTestId('profile-posts')
        expect(posts).toHaveAttribute('data-username', 'test_user')
      })
    })
  })
})