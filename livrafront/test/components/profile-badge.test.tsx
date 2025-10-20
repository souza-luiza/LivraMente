import { render } from '@testing-library/react'
import ProfileBadge from '../../src/components/profile-badge'

describe('ProfileBadge', () => {
  it('should render with default props', () => {
    const { container } = render(<ProfileBadge content="5" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width');
    expect(svg).toHaveAttribute('height');
  });

  it('should render content as text', () => {
    const { container } = render(<ProfileBadge content="10" />);
    const text = container.querySelector('text');
    
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe('10');
  });

  it('should render content as number', () => {
    const { container } = render(<ProfileBadge content={42} />);
    const text = container.querySelector('text');
    
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe('42');
  });

  it('should apply custom height', () => {
    const customHeight = 50;
    const { container } = render(<ProfileBadge content="5" height={customHeight} />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveAttribute('height', String(customHeight + customHeight * 0.3));
  });

  it('should apply custom backgroundColor', () => {
    const { container } = render(<ProfileBadge content="5" backgroundColor="red" />);
    const path = container.querySelector('path');
    
    expect(path).toHaveAttribute('fill', 'red');
  });

  it('should apply custom textColor', () => {
    const { container } = render(<ProfileBadge content="5" textColor="blue" />);
    const text = container.querySelector('text');
    
    expect(text).toHaveAttribute('fill', 'blue');
  });

  it('should apply default colors when not specified', () => {
    const { container } = render(<ProfileBadge content="5" />);
    const path = container.querySelector('path');
    const text = container.querySelector('text');
    
    expect(path).toHaveAttribute('fill', 'white');
    expect(text).toHaveAttribute('fill', 'black');
  });

  it('should adjust width based on content length', () => {
    const { container: shortContainer } = render(<ProfileBadge content="5" />);
    const { container: longContainer } = render(<ProfileBadge content="12345" />);
    
    const shortSvg = shortContainer.querySelector('svg');
    const longSvg = longContainer.querySelector('svg');
    
    const shortWidth = Number(shortSvg?.getAttribute('width'));
    const longWidth = Number(longSvg?.getAttribute('width'));
    
    expect(longWidth).toBeGreaterThan(shortWidth);
  });

  it('should pass additional SVG props', () => {
    const { container } = render(
      <ProfileBadge content="5" className="custom-class" data-testid="badge" />
    );
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveClass('custom-class');
    expect(svg).toHaveAttribute('data-testid', 'badge');
  });

  it('should render text with correct styling', () => {
    const { container } = render(<ProfileBadge content="5" height={30} />);
    const text = container.querySelector('text');
    
    expect(text).toHaveAttribute('text-anchor', 'middle');
    expect(text).toHaveAttribute('dominant-baseline', 'middle');
    expect(text).toHaveAttribute('font-weight', 'bold');
    expect(text).toHaveAttribute('font-family', 'Poppins, sans-serif');
  });

  it('should render path with correct stroke styling', () => {
    const { container } = render(<ProfileBadge content="5" />);
    const path = container.querySelector('path');
    
    expect(path).toHaveAttribute('stroke', 'black');
    expect(path).toHaveAttribute('stroke-width', '2');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('should have correct viewBox dimensions', () => {
    const height = 30;
    const { container } = render(<ProfileBadge content="5" height={height} />);
    const svg = container.querySelector('svg');
    const viewBox = svg?.getAttribute('viewBox');
    
    expect(viewBox).toContain('-1 -1');
  });
});