import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfilePage from '@/app/configuracoes/page';

// Mock do componente Sidebar
jest.mock('@/components/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock do componente SettingsTabs
jest.mock('@/app/configuracoes/settings-tabs', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-tabs">Settings Tabs</div>
}));

describe('Settings Page', () => {
  describe('Page Layout', () => {
    it('should render the page', async () => {
      const page = await UserProfilePage();
      render(page);
      
      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    it('should render sidebar component', async () => {
      const page = await UserProfilePage();
      render(page);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render settings tabs component', async () => {
      const page = await UserProfilePage();
      render(page);
      
      expect(screen.getByTestId('settings-tabs')).toBeInTheDocument();
    });

    it('should have correct page title', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const heading = screen.getByText('Configurações');
      expect(heading).toHaveClass('text-h2');
    });
  });

  describe('Page Structure', () => {
    it('should have min-h-screen container', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have flex layout', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have correct background color', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const bgContainer = container.querySelector('.bg-\\[\\#eef3eb\\]');
      expect(bgContainer).toBeInTheDocument();
    });

    it('should render main element', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('should have correct main element classes', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('flex-1 flex flex-col p-8');
    });
  });

  describe('Component Integration', () => {
    it('should render sidebar before main content', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const sidebar = screen.getByTestId('sidebar');
      const main = screen.getByRole('main');
      
      const parent = sidebar.parentElement;
      const children = Array.from(parent?.children || []);
      
      expect(children.indexOf(sidebar)).toBeLessThan(children.indexOf(main));
    });

    it('should render heading before settings tabs', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const heading = screen.getByText('Configurações');
      const settingsTabs = screen.getByTestId('settings-tabs');
      
      const parent = heading.parentElement;
      const children = Array.from(parent?.children || []);
      
      expect(children.indexOf(heading)).toBeLessThan(children.indexOf(settingsTabs));
    });
  });

  describe('Responsive Design', () => {
    it('should have flex-1 on main element for responsive width', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('flex-1');
    });

    it('should have padding on main element', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('p-8');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic main element', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement.tagName).toBe('MAIN');
    });

    it('should have proper heading hierarchy', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const heading = screen.getByRole('heading', { name: 'Configurações' });
      expect(heading).toBeInTheDocument();
    });

    it('should render heading as h2', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('Configurações');
    });
  });

  describe('Page Content', () => {
    it('should render all required components', async () => {
      const page = await UserProfilePage();
      render(page);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByTestId('settings-tabs')).toBeInTheDocument();
    });

    it('should have exactly one heading', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
    });

    it('should have exactly one main element', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const mainElements = container.querySelectorAll('main');
      expect(mainElements).toHaveLength(1);
    });
  });

  describe('Container Layout', () => {
    it('should have flex container with correct display', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const flexContainer = container.querySelector('.flex.min-h-screen');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have main with flex-col layout', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('flex-col');
    });
  });

  describe('Visual Styling', () => {
    it('should apply correct background color to container', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const styledContainer = container.querySelector('.bg-\\[\\#eef3eb\\]');
      expect(styledContainer).toBeInTheDocument();
    });

    it('should apply text-h2 class to heading', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const heading = screen.getByText('Configurações');
      expect(heading).toHaveClass('text-h2');
    });
  });

  describe('Component Rendering Order', () => {
    it('should render components in correct order', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const allContent = container.textContent;
      const sidebarIndex = allContent?.indexOf('Sidebar') || 0;
      const headingIndex = allContent?.indexOf('Configurações') || 0;
      const tabsIndex = allContent?.indexOf('Settings Tabs') || 0;
      
      expect(sidebarIndex).toBeLessThan(headingIndex);
      expect(headingIndex).toBeLessThan(tabsIndex);
    });
  });

  describe('Async Rendering', () => {
    it('should handle async component rendering', async () => {
      const page = await UserProfilePage();
      
      await waitFor(() => {
        render(page);
        expect(screen.getByText('Configurações')).toBeInTheDocument();
      });
    });

    it('should render all components after async load', async () => {
      const page = await UserProfilePage();
      render(page);
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('settings-tabs')).toBeInTheDocument();
      });
    });
  });

  describe('Page Structure Validation', () => {
    it('should have correct number of child elements in main', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement.children).toHaveLength(2);
    });

    it('should have sidebar and main as siblings', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const sidebar = screen.getByTestId('sidebar');
      const main = screen.getByRole('main');
      
      expect(sidebar.parentElement).toBe(main.parentElement);
    });
  });

  describe('CSS Classes Validation', () => {
    it('should apply all required classes to container', async () => {
      const page = await UserProfilePage();
      const { container } = render(page);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('min-h-screen flex bg-[#eef3eb]');
    });

    it('should apply all required classes to main element', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('flex-1 flex flex-col p-8');
    });
  });

  describe('Content Verification', () => {
    it('should display correct page title text', async () => {
      const page = await UserProfilePage();
      render(page);
      
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('should not render any additional headings', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent('Configurações');
    });
  });

  describe('Layout Flexibility', () => {
    it('should allow sidebar to take its natural width', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).not.toHaveClass('flex-1');
    });

    it('should allow main to grow and fill remaining space', async () => {
      const page = await UserProfilePage();
      render(page);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('flex-1');
    });
  });
});