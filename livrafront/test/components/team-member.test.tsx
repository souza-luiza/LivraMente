import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TeamMember from '@/components/team-member'

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }: any) {
    return (
      <img 
        src={typeof src === 'string' ? src : 'mock-image-src'} 
        alt={alt} 
        width={width} 
        height={height} 
        className={className}
        data-testid="team-member-image"
      />
    )
  }
})

jest.mock('next/link', () => {
  return function MockLink({ children, href, target }: any) {
    return (
      <a href={href} target={target} data-testid="link">
        {children}
      </a>
    )
  }
})

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileHover, ...props }: any) => (
      <div 
        data-initial-scale={initial?.scale}
        data-initial-opacity={initial?.opacity}
        data-animate-scale={animate?.scale}
        data-animate-opacity={animate?.opacity}
        data-transition-type={transition?.type}
        data-while-hover-scale={whileHover?.scale}
        {...props}
      >
        {children}
      </div>
    ),
  },
}))

jest.mock('@/components/icons/GithubIcon', () => {
  return function MockGitHubIcon({ size, fill }: any) {
    return <div data-testid="github-icon" data-size={size} data-fill={fill}>GitHubIcon</div>
  }
})

jest.mock('@/components/icons/LinkedinIcon', () => {
  return function MockLinkedinIcon({ size, fill }: any) {
    return <div data-testid="linkedin-icon" data-size={size} data-fill={fill}>LinkedInIcon</div>
  }
})

const mockImage = 'test-image.jpg'

describe('TeamMember Component', () => {
  const defaultProps = {
    img: mockImage,
    name: 'John Doe',
  }

  describe('Rendering Tests', () => {
    it('should render with default props', () => {
      render(<TeamMember {...defaultProps} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByTestId('team-member-image')).toHaveAttribute('src', mockImage)
      expect(screen.getByTestId('team-member-image')).toHaveAttribute('alt', 'John Doe')
    })

    it('should render with custom image size', () => {
      render(<TeamMember {...defaultProps} imgSize={120} />)
      
      const imageContainer = screen.getByTestId('team-member-image').closest('div')
      expect(imageContainer).toHaveStyle({
        width: '120px',
        height: '120px',
      })
    })

    it('should render with custom name style', () => {
      render(<TeamMember {...defaultProps} nameStyle="text-h3 custom-class" />)
      
      const nameElement = screen.getByText('John Doe')
      expect(nameElement).toHaveClass('text-h3 custom-class')
    })

    it('should render with custom color', () => {
      render(<TeamMember {...defaultProps} color="#FF5733" />)
      
      const imageContainer = screen.getByTestId('team-member-image').closest('div')
      expect(imageContainer).toHaveStyle({
        borderColor: '#FF5733',
      })
      
      const nameElement = screen.getByText('John Doe')
      expect(nameElement).toHaveClass('text-[#FF5733]')
    })
  })

  describe('Social Links Tests', () => {
    it('should render GitHub link when provided', () => {
      const githubUrl = 'https://github.com/johndoe'
      render(<TeamMember {...defaultProps} github={githubUrl} />)
      
      const githubLink = screen.getByTestId('github-icon').closest('a')
      expect(githubLink).toHaveAttribute('href', githubUrl)
      expect(githubLink).toHaveAttribute('target', '_blank')
    })

    it('should render LinkedIn link when provided', () => {
      const linkedinUrl = 'https://linkedin.com/in/johndoe'
      render(<TeamMember {...defaultProps} linkedin={linkedinUrl} />)
      
      const linkedinLink = screen.getByTestId('linkedin-icon').closest('a')
      expect(linkedinLink).toHaveAttribute('href', linkedinUrl)
      expect(linkedinLink).toHaveAttribute('target', '_blank')
    })

    it('should render both GitHub and LinkedIn links when provided', () => {
      render(<TeamMember 
        {...defaultProps} 
        github="https://github.com/johndoe"
        linkedin="https://linkedin.com/in/johndoe"
      />)
      
      expect(screen.getByTestId('github-icon')).toBeInTheDocument()
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument()
    })

    it('should not render social links when not provided', () => {
      render(<TeamMember {...defaultProps} />)
      
      expect(screen.queryByTestId('github-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('linkedin-icon')).not.toBeInTheDocument()
    })
  })

  describe('Icon Size Tests', () => {
    it('should use medium icon size by default', () => {
      render(<TeamMember {...defaultProps} github="https://github.com/johndoe" />)
      
      const githubIcon = screen.getByTestId('github-icon')
      expect(githubIcon).toHaveAttribute('data-size', '28')
    })

    it('should use small icon size when specified', () => {
      render(<TeamMember {...defaultProps} github="https://github.com/johndoe" buttonSize="small" />)
      
      const githubIcon = screen.getByTestId('github-icon')
      expect(githubIcon).toHaveAttribute('data-size', '24')
    })

    it('should use large icon size when specified', () => {
      render(<TeamMember {...defaultProps} github="https://github.com/johndoe" buttonSize="large" />)
      
      const githubIcon = screen.getByTestId('github-icon')
      expect(githubIcon).toHaveAttribute('data-size', '32')
    })
  })

  describe('Animation Props Tests', () => {
    it('should apply scale animation by default', () => {
      render(<TeamMember {...defaultProps} />)
      
      const motionDiv = screen.getByText('John Doe').closest('div')
      expect(motionDiv).toHaveAttribute('data-initial-scale', '0')
      expect(motionDiv).toHaveAttribute('data-animate-scale', '1')
      expect(motionDiv).toHaveAttribute('data-while-hover-scale', '1.1')
    })

    it('should not apply scale animation when initialScale is false', () => {
      render(<TeamMember {...defaultProps} initialScale={false} />)
      
      const motionDiv = screen.getByText('John Doe').closest('div')
      expect(motionDiv).not.toHaveAttribute('data-initial-scale')
      expect(motionDiv).not.toHaveAttribute('data-animate-scale')
    })

    it('should not apply hover scale when hoverScale is false', () => {
      render(<TeamMember {...defaultProps} hoverScale={false} />)
      
      const motionDiv = screen.getByText('John Doe').closest('div')
      expect(motionDiv).not.toHaveAttribute('data-while-hover-scale')
    })

    it('should apply correct transition props', () => {
      render(<TeamMember {...defaultProps} />)
      
      const motionDiv = screen.getByText('John Doe').closest('div')
      expect(motionDiv).toHaveAttribute('data-transition-type', 'spring')
    })
  })

  describe('Layout and Styling Tests', () => {
    it('should have correct flex layout', () => {
      render(<TeamMember {...defaultProps} />)
      
      const container = screen.getByText('John Doe').closest('div')
      expect(container).toHaveClass('flex flex-col items-center gap-2')
    })

    it('should have circular image with border and shadow', () => {
      render(<TeamMember {...defaultProps} />)
      
      const imageContainer = screen.getByTestId('team-member-image').closest('div')
      expect(imageContainer).toHaveClass('rounded-full overflow-hidden border-[2px] shadow-md')
    })

    it('should have social buttons in a row with gap', () => {
      render(<TeamMember {...defaultProps} github="https://github.com/johndoe" linkedin="https://linkedin.com/in/johndoe" />)
      
    const socialContainer = screen.getByTestId('github-icon').closest('div')?.parentElement?.closest('div')
    expect(socialContainer).toHaveClass('flex flex-row gap-3')
    })

    it('should apply correct color to icons', () => {
      render(<TeamMember {...defaultProps} color="#3366FF" github="https://github.com/johndoe" />)
      
      const githubIcon = screen.getByTestId('github-icon')
      expect(githubIcon).toHaveAttribute('data-fill', '#3366FF')
    })
  })

  describe('Accessibility Tests', () => {
    it('should have proper alt text for image', () => {
      render(<TeamMember {...defaultProps} />)
      
      const image = screen.getByTestId('team-member-image')
      expect(image).toHaveAttribute('alt', 'John Doe')
    })

    it('should have proper image dimensions', () => {
      render(<TeamMember {...defaultProps} imgSize={100} />)
      
      const image = screen.getByTestId('team-member-image')
      expect(image).toHaveAttribute('width', '100')
      expect(image).toHaveAttribute('height', '100')
    })

    it('should have external links opening in new tab', () => {
      render(<TeamMember 
        {...defaultProps} 
        github="https://github.com/johndoe"
        linkedin="https://linkedin.com/in/johndoe"
      />)
      
      const links = screen.getAllByTestId('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long names', () => {
      const longName = 'Dr. Professor Johnathan Christopher Doe the Third'
      render(<TeamMember {...defaultProps} name={longName} />)
      
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle different image types', () => {
      const staticImport = { src: 'static-import.jpg', width: 100, height: 100 }
      render(<TeamMember {...defaultProps} img={staticImport as any} />)
      
      expect(screen.getByTestId('team-member-image')).toBeInTheDocument()
    })

    it('should render without social buttons container when no links provided', () => {
      render(<TeamMember {...defaultProps} />)
      
      const socialIcons = screen.queryByTestId('github-icon') || screen.queryByTestId('linkedin-icon')
      expect(socialIcons).not.toBeInTheDocument()
    })
  })

  describe('Prop Combinations', () => {
    it('should work with all custom props together', () => {
      render(<TeamMember 
        img={mockImage}
        imgSize={150}
        name="Jane Smith"
        nameStyle="text-h2 custom-style"
        color="#FF0000"
        initialScale={false}
        hoverScale={false}
        github="https://github.com/janesmith"
        linkedin="https://linkedin.com/in/janesmith"
        buttonSize="large"
      />)
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toHaveClass('text-h2 custom-style')
      
      const imageContainer = screen.getByTestId('team-member-image').closest('div')
      expect(imageContainer).toHaveStyle({
        width: '150px',
        height: '150px',
        borderColor: '#FF0000',
      })
      
      expect(screen.getByTestId('github-icon')).toHaveAttribute('data-size', '32')
      expect(screen.getByTestId('linkedin-icon')).toHaveAttribute('data-size', '32')
    })
  })
})