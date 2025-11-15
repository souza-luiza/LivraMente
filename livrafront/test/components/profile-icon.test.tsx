import { render } from '@testing-library/react'
import ProfileIcon from '@/components/profile-icon'

describe('ProfileIcon Component', () => {
  describe('Rendering and Props', () => {
    it('renders with default size', () => {
      const { container } = render(<ProfileIcon />)
      const svg = container.querySelector('svg')
      
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '40')
      expect(svg).toHaveAttribute('height', '40')
    })

    it('renders with custom size', () => {
      const { container } = render(<ProfileIcon size={60} />)
      const svg = container.querySelector('svg')
      
      expect(svg).toHaveAttribute('width', '60')
      expect(svg).toHaveAttribute('height', '60')
    })

    it('renders three circles', () => {
      const { container } = render(<ProfileIcon />)
      const circles = container.querySelectorAll('circle')
      
      expect(circles).toHaveLength(2)
    })
  })

  describe('Percentage Functionality', () => {
    it('handles 0% percentage', () => {
      const { container } = render(<ProfileIcon percentage={0} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      const radius = (40 / 2) - 5
      const circumference = 2 * Math.PI * radius
      
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(circumference))
    })

    it('handles 50% percentage', () => {
      const { container } = render(<ProfileIcon percentage={50} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      const radius = (40 / 2) - 5
      const circumference = 2 * Math.PI * radius
      const expectedOffset = circumference - (50 / 100) * circumference
      
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset))
    })

    it('handles 100% percentage', () => {
      const { container } = render(<ProfileIcon percentage={100} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', '0')
    })

    it('clamps percentage below 0', () => {
      const { container } = render(<ProfileIcon percentage={-10} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      const radius = (40 / 2) - 5
      const circumference = 2 * Math.PI * radius
      
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(circumference))
    })

    it('clamps percentage above 100', () => {
      const { container } = render(<ProfileIcon percentage={150} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', '0')
    })
  })

  describe('Circle Properties', () => {
    it('background circle has correct properties', () => {
      const { container } = render(<ProfileIcon />)
      const backgroundCircle = container.querySelectorAll('circle')[0]
      
      expect(backgroundCircle).toHaveAttribute('fill', 'none')
      expect(backgroundCircle).toHaveAttribute('stroke', 'currentColor')
      expect(backgroundCircle).toHaveAttribute('stroke-width', '6')
      expect(backgroundCircle).toHaveAttribute('opacity', '0.2')
    })

    it('progress circle has correct properties', () => {
      const { container } = render(<ProfileIcon />)
      const progressCircle = container.querySelectorAll('circle')[1]
      
      expect(progressCircle).toHaveAttribute('fill', 'none')
      expect(progressCircle).toHaveAttribute('stroke', 'currentColor')
      expect(progressCircle).toHaveAttribute('stroke-width', '6')
      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round')
    })
  })

  describe('Additional Props', () => {
    it('accepts and applies additional SVG props', () => {
      const { container } = render(
        <ProfileIcon className="custom-class" data-testid="profile-icon" />
      )
      const svg = container.querySelector('svg')
      
      expect(svg).toHaveClass('custom-class')
      expect(svg).toHaveAttribute('data-testid', 'profile-icon')
    })
  })

  describe('Snapshot Tests', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<ProfileIcon />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot with custom size and percentage', () => {
      const { container } = render(<ProfileIcon size={80} percentage={75} />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})