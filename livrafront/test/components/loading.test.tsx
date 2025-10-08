import { render, screen } from '@testing-library/react'
import LoadingPage from '../../src/components/loading'

// Mock the LogoIcon component
jest.mock('../../src/components/icons/LogoIcon', () => {
  return function MockLogoIcon() {
    return <div data-testid="logo-icon">Mock Logo Icon</div>
  }
})

describe('LoadingPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<LoadingPage />)
    
    // The main container should be in the document
    expect(screen.getByTestId('logo-icon')).toBeInTheDocument()
  })

  it('renders with correct layout structure', () => {
    render(<LoadingPage />)
    
    // Check if the main container has correct classes using data-testids
    const mainContainer = screen.getByTestId('loading-main')
    expect(mainContainer).toHaveClass('flex items-center justify-center h-screen w-screen bg-white')
  })

  it('displays the logo icon', () => {
    render(<LoadingPage />)
    
    const logoIcon = screen.getByTestId('logo-icon')
    expect(logoIcon).toBeInTheDocument()
  })

  it('has the spinning animation element', () => {
    render(<LoadingPage />)
    
    // Find the spinning border element by its data-testid
    const spinningElement = screen.getByTestId('spinning-element')
    expect(spinningElement).toBeInTheDocument()
    expect(spinningElement).toHaveClass('absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full')
  })

  it('applies correct styling to logo container', () => {
    render(<LoadingPage />)
    
    const logoContainer = screen.getByTestId('logo-container')
    expect(logoContainer).toHaveClass('w-24 h-24 text-[#1F2A17]')
  })

  it('has relative positioning on the middle container', () => {
    render(<LoadingPage />)
    
    const relativeContainer = screen.getByTestId('loading-middle')
    expect(relativeContainer).toHaveClass('relative flex items-center justify-center')
  })
})