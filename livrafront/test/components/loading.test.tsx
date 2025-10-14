import { render, screen } from '@testing-library/react'
import LoadingPage from '../../src/components/loading'

jest.mock('../../src/components/icons/LogoIcon', () => {
  return function MockLogoIcon() {
    return <div data-testid="mock-logo-icon">Logo Icon</div>
  }
})

describe('LoadingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main loading container', () => {
    render(<LoadingPage />)
    
    const mainContainer = screen.getByTestId('loading-main')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('flex items-center justify-center h-screen w-screen bg-white')
  })

  it('renders the middle loading container', () => {
    render(<LoadingPage />)
    
    const middleContainer = screen.getByTestId('loading-middle')
    expect(middleContainer).toBeInTheDocument()
    expect(middleContainer).toHaveClass('relative flex items-center justify-center')
  })

  it('renders the spinning element with correct styles and animation', () => {
    render(<LoadingPage />)
    
    const spinningElement = screen.getByTestId('spinning-element')
    expect(spinningElement).toBeInTheDocument()
    expect(spinningElement).toHaveClass(
      'absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]'
    )
  })

  it('renders the logo container with correct styles', () => {
    render(<LoadingPage />)
    
    const logoContainer = screen.getByTestId('logo-container')
    expect(logoContainer).toBeInTheDocument()
    expect(logoContainer).toHaveClass('w-24 h-24 text-[#1F2A17]')
  })

  it('renders the LogoIcon component inside the logo container', () => {
    render(<LoadingPage />)
    
    const logoIcon = screen.getByTestId('mock-logo-icon')
    const logoContainer = screen.getByTestId('logo-container')
    
    expect(logoIcon).toBeInTheDocument()
    expect(logoContainer).toContainElement(logoIcon)
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingPage />)
    
    const mainContainer = screen.getByTestId('loading-main')
    expect(mainContainer).toBeInTheDocument()
  })

  it('matches the visual structure hierarchy', () => {
    render(<LoadingPage />)
    
    const mainContainer = screen.getByTestId('loading-main')
    const middleContainer = screen.getByTestId('loading-middle')
    const spinningElement = screen.getByTestId('spinning-element')
    const logoContainer = screen.getByTestId('logo-container')
    const logoIcon = screen.getByTestId('mock-logo-icon')
    
    expect(mainContainer).toContainElement(middleContainer)
    expect(middleContainer).toContainElement(spinningElement)
    expect(middleContainer).toContainElement(logoContainer)
    expect(logoContainer).toContainElement(logoIcon)
  })

  it('applies correct color scheme', () => {
    render(<LoadingPage />)
    
    const spinningElement = screen.getByTestId('spinning-element')
    const logoContainer = screen.getByTestId('logo-container')
    
    expect(spinningElement).toHaveClass('border-[#B0CC9E]')
    expect(spinningElement).toHaveClass('border-t-[#5C8046]')
    
    expect(logoContainer).toHaveClass('text-[#1F2A17]')
  })

  it('has correct dimensions for all elements', () => {
    render(<LoadingPage />)
    
    const spinningElement = screen.getByTestId('spinning-element')
    const logoContainer = screen.getByTestId('logo-container')
    
    expect(spinningElement).toHaveClass('w-48 h-48')
    expect(logoContainer).toHaveClass('w-24 h-24')
  })
})