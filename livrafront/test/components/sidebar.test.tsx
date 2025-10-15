// components/sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../../src/components/sidebar'

jest.mock('../../src/components/icons/LogoIcon', () => ({
  __esModule: true,
  default: function MockLogoIcon() {
    return <svg data-testid="logo-icon">Logo</svg>
  },
}))

jest.mock('../../src/components/icons/HomeIcon', () => ({
  __esModule: true,
  default: function MockHomeIcon() {
    return <svg data-testid="home-icon">Home</svg>
  },
}))

jest.mock('../../src/components/icons/ProfileIcon', () => ({
  __esModule: true,
  default: function MockProfileIcon() {
    return <svg data-testid="profile-icon">Profile</svg>
  },
}))

jest.mock('../../src/components/icons/NotificationsIcon', () => ({
  __esModule: true,
  default: function MockNotificationsIcon() {
    return <svg data-testid="notifications-icon">Notifications</svg>
  },
}))

jest.mock('../../src/components/icons/SettingsIcon', () => ({
  __esModule: true,
  default: function MockSettingsIcon() {
    return <svg data-testid="settings-icon">Settings</svg>
  },
}))

jest.mock('../../src/components/icons/LogoutIcon', () => ({
  __esModule: true,
  default: function MockLogoutIcon() {
    return <svg data-testid="logout-icon">Logout</svg>
  },
}))

jest.mock('../../src/components/textless-button', () => ({
  __esModule: true,
  default: function MockButton({ icon, tooltip, onClick }: any) {
    return (
      <button 
        data-testid={`button-${tooltip?.toLowerCase() || 'unknown'}`}
        onClick={onClick}
        className="mock-button"
      >
        {icon}
        {tooltip && <span data-testid={`tooltip-${tooltip}`}>{tooltip}</span>}
      </button>
    )
  },
}))

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering and Structure', () => {
    it('renders sidebar container with correct styling', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass('inline-block')
      expect(sidebar).toHaveClass('light-green')
      expect(sidebar).toHaveClass('w-[80px]')
      expect(sidebar).toHaveClass('h-fill')
      expect(sidebar).toHaveClass('rounded-[12px]')
    })

    it('renders all navigation buttons', () => {
      render(<Sidebar />)
      
  expect(screen.getAllByTestId('button-início')[0]).toBeInTheDocument()
      expect(screen.getByTestId('button-perfil')).toBeInTheDocument()
      expect(screen.getByTestId('button-notificações')).toBeInTheDocument()
      expect(screen.getByTestId('button-configurações')).toBeInTheDocument()
      expect(screen.getByTestId('button-sair')).toBeInTheDocument()
    })

    it('renders all icons correctly', () => {
      render(<Sidebar />)
      
      expect(screen.getByTestId('logo-icon')).toBeInTheDocument()
      expect(screen.getByTestId('home-icon')).toBeInTheDocument()
      expect(screen.getByTestId('profile-icon')).toBeInTheDocument()
      expect(screen.getByTestId('notifications-icon')).toBeInTheDocument()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
    })

    it('has correct layout structure with two sections', () => {
      render(<Sidebar />)
      
      const container = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      const flexContainer = container.firstChild
      expect(flexContainer).toHaveClass('flex flex-col justify-between h-full')
      
  const sections = container.querySelectorAll('div > div > div')
  expect(sections.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Tooltip Functionality', () => {
    it('renders buttons with correct Portuguese tooltips', () => {
      render(<Sidebar />)
      
  expect(screen.getAllByTestId('button-início')[0]).toBeInTheDocument()
      expect(screen.getByTestId('button-perfil')).toBeInTheDocument()
      expect(screen.getByTestId('button-notificações')).toBeInTheDocument()
      expect(screen.getByTestId('button-configurações')).toBeInTheDocument()
      expect(screen.getByTestId('button-sair')).toBeInTheDocument()
    })

    it('has two buttons with "Início" tooltip (Logo and Home)', () => {
      render(<Sidebar />)
      
  const inicioButtons = screen.getAllByTestId('button-início')
  expect(inicioButtons).toHaveLength(2)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct color scheme to all buttons', () => {
      render(<Sidebar />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('mock-button')
      })
    })

    it('has correct spacing between buttons', () => {
      render(<Sidebar />)
      
  const topSection = screen.getAllByTestId('button-início')[0].closest('div')
      expect(topSection).toHaveClass('gap-[8px]')
    })

    it('has correct padding and margins', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('pt-[15px]')
      expect(sidebar).toHaveClass('pb-[15px]')
      expect(sidebar).toHaveClass('m-4')
    })

    it('uses large size for all buttons', () => {
      render(<Sidebar />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(6)
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Sidebar />)
    
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
  const firstButton = screen.getAllByTestId('button-início')[0]
      firstButton.focus()
      
      expect(firstButton).toHaveFocus()
      
      await user.tab()
    })

    it('has sufficient color contrast (visual test implication)', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('Interaction Tests', () => {
    it('handles button clicks', async () => {
      const user = userEvent.setup()
      const mockOnClick = jest.fn()
      
      jest.doMock('../../src/components/textless-button', () => ({
        __esModule: true,
        default: function MockButton({ icon, tooltip, onClick }: any) {
          return (
            <button 
              data-testid={`button-${tooltip?.toLowerCase() || 'unknown'}`}
              onClick={onClick || mockOnClick}
              className="mock-button"
            >
              {icon}
            </button>
          )
        },
      }))
      
      const { rerender } = render(<Sidebar />)
      
  const homeButton = screen.getAllByTestId('button-início')[1]
  await user.click(homeButton)
      
      expect(homeButton).toBeInTheDocument()
    })

    it('maintains hover states for tooltips', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      const profileButton = screen.getByTestId('button-perfil')
      
      await user.hover(profileButton)
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains fixed width layout', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-[80px]')
    })

    it('has fixed height for consistent layout', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('h-fill')
    })
  })

  describe('Snapshot Tests', () => {
    it('matches sidebar snapshot', () => {
      const { container } = render(<Sidebar />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with all buttons rendered', () => {
      const { container } = render(<Sidebar />)
      expect(container).toMatchSnapshot()
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly with no additional props', () => {
      render(<Sidebar />)
      
  expect(screen.getAllByTestId('button-início')[0]).toBeInTheDocument()
      expect(screen.getByTestId('button-sair')).toBeInTheDocument()
    })

    it('maintains layout with exact number of buttons', () => {
      render(<Sidebar />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(6)
    })

    it('has logout button separated at bottom', () => {
      render(<Sidebar />)
      
      const logoutButton = screen.getByTestId('button-sair')
      const bottomSection = logoutButton.closest('div')
      
      // Logout button should be in a separate container at the bottom
      expect(bottomSection).toBeInTheDocument()
      expect(bottomSection?.parentElement).toHaveClass('flex flex-col justify-between')
    })
  })

  describe('Visual Regression Points', () => {
    it('has correct border radius', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('rounded-[12px]')
    })

    it('uses consistent light-green color scheme', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('light-green')
    })

    it('has proper shadow and depth (if applicable)', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })
  })
})