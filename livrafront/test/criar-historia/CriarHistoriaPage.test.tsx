import { render, screen } from '@testing-library/react';
import CreateStoryPage from '@/app/criar-historia/page';

// Mock dos componentes
jest.mock('@/components/sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('@/app/criar-historia/story-creator', () => {
  return function MockCreateStory() {
    return <div data-testid="create-story">Create Story Component</div>;
  };
});

describe('CreateStoryPage', () => {
  it('deve renderizar a página com Sidebar e CreateStory', () => {
    render(<CreateStoryPage />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('create-story')).toBeInTheDocument();
  });

  it('deve ter a estrutura de layout correta', () => {
    const { container } = render(<CreateStoryPage />);
    
    const mainContainer = container.querySelector('.min-h-screen.flex');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('bg-[#eef3eb]');
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1 flex flex-col');
  });

  it('deve renderizar Sidebar antes de CreateStory', () => {
    const { container } = render(<CreateStoryPage />);
    
    const children = Array.from(container.querySelector('.min-h-screen')?.children || []);
    const sidebarIndex = children.findIndex(child => child.getAttribute('data-testid') === 'sidebar');
    const mainIndex = children.findIndex(child => child.tagName === 'MAIN');
    
    expect(sidebarIndex).toBeLessThan(mainIndex);
  });
});