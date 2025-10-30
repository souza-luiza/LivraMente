import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LivraTime from '@/app/livratime/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onHoverStart, onHoverEnd, ...props }: any) => (
      <div 
        onMouseEnter={onHoverStart} 
        onMouseLeave={onHoverEnd}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}))

jest.mock('@/components/button', () => {
  const { useRouter } = jest.requireMock('next/navigation')
  return function MockButton({ text, icon, onClick, path }: any) {
    const router = useRouter && useRouter();
    const handle = (e: any) => {
      if (onClick) onClick(e)
      if (path && router && router.push) router.push(path)
    }
    return (
      <button onClick={handle} data-testid={`button-${text.toLowerCase().replace(' ', '-')}`}>
        {icon} {text}
      </button>
    )
  }
})

jest.mock('@/components/team-member', () => {
  return function MockTeamMember({ name, img, github, linkedin, imgSize }: any) {
    return (
      <div data-testid={`team-member-${name.toLowerCase()}`}>
        <img 
          src={typeof img === 'string' ? img : 'mock-image-src'} 
          alt={name} 
          width={imgSize} 
        />
        <h3>{name}</h3>
        {github && <a href={github} data-testid={`github-${name.toLowerCase()}`}>GitHub</a>}
        {linkedin && <a href={linkedin} data-testid={`linkedin-${name.toLowerCase()}`}>LinkedIn</a>}
      </div>
    )
  }
})

jest.mock('@/components/icons/LogoIcon', () => ({ size, fill, className }: any) => 
  `LogoIcon-${size}-${fill}${className ? ` ${className}` : ''}`
)
jest.mock('@/components/icons/LoginIcon', () => () => 'LoginIcon')
jest.mock('@/components/icons/Edit3Icon', () => () => 'Edit3Icon')
jest.mock('@/components/icons/HomeIcon', () => () => 'HomeIcon')

jest.mock('../../public/team/Enzo.jpeg', () => 'enzo-image.jpg')
jest.mock('../../public/team/Isabele.jpeg', () => 'isabele-image.jpg')
jest.mock('../../public/team/Zampoli.jpeg', () => 'zampoli-image.jpg')
jest.mock('../../public/team/Akemi.jpeg', () => 'akemi-image.jpg')
jest.mock('../../public/team/Loren.jpeg', () => 'loren-image.jpg')
jest.mock('../../public/team/Luiza.jpeg', () => 'luiza-image.jpg')
jest.mock('../../public/team/Vivi.jpeg', () => 'vivi-image.jpg')
jest.mock('../../public/team/Kemi.jpg', () => 'kemi-image.jpg')

describe('LivraTime Page', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    const { useRouter } = jest.requireMock('next/navigation') as { useRouter: jest.Mock }
    useRouter.mockReturnValue({
      push: mockPush,
    })
    mockPush.mockClear()
  })

  describe('Rendering Tests', () => {
    it('should render the main layout structure correctly', () => {
      render(<LivraTime />)

      // Use testids added to the component for stable selection
      const mainContainer = screen.getByTestId('top-section').parentElement
      expect(mainContainer).toHaveClass('h-screen')
      expect(mainContainer).toHaveClass('w-screen')
      expect(mainContainer).toHaveClass('flex')
      expect(mainContainer).toHaveClass('flex-col')

      const topSection = screen.getByTestId('top-section')
      const bottomSection = screen.getByTestId('bottom-section')

      expect(topSection).toHaveClass('h-4/9')
      expect(bottomSection).toHaveClass('h-5/9')
    })

    it('should render all navigation buttons', () => {
      render(<LivraTime />)
      
      expect(screen.getByTestId('button-página-inicial')).toBeInTheDocument()
      expect(screen.getByTestId('button-entrar')).toBeInTheDocument()
      expect(screen.getByTestId('button-cadastrar')).toBeInTheDocument()
    })

    it('should render the team logo and branding initially', () => {
      render(<LivraTime />)
      
      expect(screen.getByText(/LogoIcon-120-#23160A/)).toBeInTheDocument()
      expect(screen.getByText('LivraTime')).toBeInTheDocument()
      expect(screen.getByText('O time dos leitores brasileiros')).toBeInTheDocument()
    })

    it('should render all team members in the bottom section', () => {
      render(<LivraTime />)
      
      const teamMembers = [
        'enzo', 'isabele', 'dr zampoli', 'akemi', 'loren', 'magalu', 'vivirgínia'
      ]
      
      teamMembers.forEach(member => {
        expect(screen.getByTestId(`team-member-${member}`)).toBeInTheDocument()
      })
    })

    it('should render team members with correct names', () => {
      render(<LivraTime />)
      
      expect(screen.getByText('Enzo')).toBeInTheDocument()
      expect(screen.getByText('Isabele')).toBeInTheDocument()
      expect(screen.getByText('Dr Zampoli')).toBeInTheDocument()
      expect(screen.getByText('Akemi')).toBeInTheDocument()
      expect(screen.getByText('Loren')).toBeInTheDocument()
      expect(screen.getByText('MagaLu')).toBeInTheDocument()
      expect(screen.getByText('Vivirgínia')).toBeInTheDocument()
    })

    it('should render social links for team members', () => {
      render(<LivraTime />)
      
      expect(screen.getByTestId('github-enzo')).toHaveAttribute('href', 'https://github.com/EnzoBelfort')
      expect(screen.getByTestId('linkedin-enzo')).toHaveAttribute('href', 'https://www.linkedin.com/in/enzobelfort')
      expect(screen.getByTestId('github-isabele')).toHaveAttribute('href', 'https://github.com/isabele7')
    })
  })

  describe('Navigation Tests', () => {
    it('should navigate to home page when Página Inicial button is clicked', async () => {
      render(<LivraTime />)
      
      const homeButton = screen.getByTestId('button-página-inicial')
      await userEvent.click(homeButton)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to login page when Entrar button is clicked', async () => {
      render(<LivraTime />)
      
      const loginButton = screen.getByTestId('button-entrar')
      await userEvent.click(loginButton)
      expect(mockPush).toHaveBeenCalledWith('/entrar')
    })

    it('should navigate to register page when Cadastrar button is clicked', async () => {
      render(<LivraTime />)
      
      const registerButton = screen.getByTestId('button-cadastrar')
      await userEvent.click(registerButton)
      expect(mockPush).toHaveBeenCalledWith('/cadastro')
    })
  })

  describe('Hover Interaction Tests', () => {
    it('should show Kemi when hovering over logo area', async () => {
      render(<LivraTime />)
      
      expect(screen.getByText('LivraTime')).toBeInTheDocument()
      expect(screen.queryByText("Kemi Funnycat's")).not.toBeInTheDocument()
      
      const hoverArea = screen.getByText('LivraTime').closest('div')?.parentElement
      
      if (hoverArea) {
        await userEvent.hover(hoverArea)
        
        await waitFor(() => {
          expect(screen.getByText("Kemi Funnycat's")).toBeInTheDocument()
        })
        
        expect(screen.queryByText('LivraTime')).not.toBeInTheDocument()
      }
    })

    it('should show logo again when unhovering', async () => {
      render(<LivraTime />)
      
      const hoverArea = screen.getByText('LivraTime').closest('div')?.parentElement
      
      if (hoverArea) {
        await userEvent.hover(hoverArea)
        await waitFor(() => {
          expect(screen.getByText("Kemi Funnycat's")).toBeInTheDocument()
        })
        
        await userEvent.unhover(hoverArea)
        await waitFor(() => {
          expect(screen.getByText('LivraTime')).toBeInTheDocument()
        })
        
        expect(screen.queryByText("Kemi Funnycat's")).not.toBeInTheDocument()
      }
    })
  })

  describe('Layout and Styling Tests', () => {
    it('should have correct section proportions', () => {
      render(<LivraTime />)
      
      const topSection = screen.getByTestId('top-section')
      const bottomSection = screen.getByTestId('bottom-section')
      
      expect(topSection).toHaveClass('h-4/9')
      expect(bottomSection).toHaveClass('h-5/9')
    })

    it('should have correct background colors', () => {
      render(<LivraTime />)
      
      const topSection = screen.getByTestId('top-section')
      const bottomSection = screen.getByTestId('bottom-section')
      
      expect(topSection).toHaveClass('bg-[#FFFFFF]')
      expect(bottomSection).toHaveClass('bg-[#B0CC9E]')
    })

    it('should have team members arranged in a row with gaps', () => {
      render(<LivraTime />)
      
      const teamContainer = screen.getByTestId('team-member-enzo')?.closest('div')?.parentElement
      expect(teamContainer).toHaveClass('flex flex-row gap-[32px]')
    })

    it('should have proper text styling for team names', () => {
      render(<LivraTime />)
      
      const enzoName = screen.getByText('Enzo')
      expect(enzoName).toBeInTheDocument()
    })
  })

  describe('Team Data Tests', () => {
    it('should render all team members from the team array', () => {
      render(<LivraTime />)
      
      const teamData = [
        { name: 'Enzo', github: 'https://github.com/EnzoBelfort', linkedin: 'https://www.linkedin.com/in/enzobelfort' },
        { name: 'Isabele', github: 'https://github.com/isabele7', linkedin: 'https://www.linkedin.com/in/isabele-nascimento' },
        { name: 'Dr Zampoli', github: 'https://github.com/JoaoPedroZampoli', linkedin: 'https://www.linkedin.com/in/joaopedrozampoli' },
        { name: 'Akemi', github: 'https://github.com/akemiikemoto', linkedin: 'https://www.linkedin.com/in/leticia-akemi-ikemoto' },
        { name: 'Loren', github: 'https://github.com/Loworen', linkedin: 'https://www.linkedin.com/in/loren-pe%C3%B1a-rodriguez-lorenzetto-616a13382/' },
        { name: 'MagaLu', github: 'https://github.com/souza-luiza', linkedin: 'https://www.linkedin.com/in/luizadesouzaferreira' },
        { name: 'Vivirgínia', github: 'https://github.com/parkvivi', linkedin: 'https://www.linkedin.com/in/viviane-park' }
      ]
      
      teamData.forEach(member => {
        const teamMember = screen.getByTestId(`team-member-${member.name.toLowerCase()}`)
        expect(teamMember).toBeInTheDocument()
        
        if (member.github) {
          expect(screen.getByTestId(`github-${member.name.toLowerCase()}`)).toHaveAttribute('href', member.github)
        }
        if (member.linkedin) {
          expect(screen.getByTestId(`linkedin-${member.name.toLowerCase()}`)).toHaveAttribute('href', member.linkedin)
        }
      })
    })

    it('should render Kemi as the special hover team member', async () => {
      render(<LivraTime />)
      
      const hoverArea = screen.getByText('LivraTime').closest('div')?.parentElement
      
      if (hoverArea) {
        await userEvent.hover(hoverArea)
        
        await waitFor(() => {
          expect(screen.getByTestId('team-member-kemi funnycat\'s')).toBeInTheDocument()
        })
        
        const kemiMember = screen.getByTestId('team-member-kemi funnycat\'s')
        expect(kemiMember).toHaveTextContent("Kemi Funnycat's")
      }
    })
  })

  describe('Accessibility Tests', () => {
    it('should have all buttons properly labeled', () => {
      render(<LivraTime />)
      
      expect(screen.getByTestId('button-página-inicial')).toHaveTextContent('Página Inicial')
      expect(screen.getByTestId('button-entrar')).toHaveTextContent('Entrar')
      expect(screen.getByTestId('button-cadastrar')).toHaveTextContent('Cadastrar')
    })

    it('should have proper image alt texts for team members', () => {
      render(<LivraTime />)
      
      const enzoImage = screen.getByAltText('Enzo')
      const isabeleImage = screen.getByAltText('Isabele')
      
      expect(enzoImage).toBeInTheDocument()
      expect(isabeleImage).toBeInTheDocument()
    })

    it('should have social links with proper href attributes', () => {
      render(<LivraTime />)
      
      const githubLinks = screen.getAllByText('GitHub')
      const linkedinLinks = screen.getAllByText('LinkedIn')
      
      expect(githubLinks.length).toBeGreaterThan(0)
      expect(linkedinLinks.length).toBeGreaterThan(0)
      
      githubLinks.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })
})