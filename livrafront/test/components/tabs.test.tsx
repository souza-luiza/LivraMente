import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabProvider, TabList, Tab, TabPanel } from '../../src/components/tabs';

describe('TabProvider', () => {
  it('should render children', () => {
    render(
      <TabProvider value="tab1">
        <div>Test Content</div>
      </TabProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide initial value to context', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('should call onChange callback when tab changes', () => {
    const handleChange = jest.fn();
    render(
      <TabProvider value="tab1" onChange={handleChange}>
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
        </TabList>
      </TabProvider>
    );
    
    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });
});

describe('TabList', () => {
  it('should render with default classes', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <div>Content</div>
        </TabList>
      </TabProvider>
    );
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveClass('flex', 'border-b-2', 'border-[#ededed]');
  });

  it('should apply custom className', () => {
    render(
      <TabProvider value="tab1">
        <TabList className="custom-class">
          <div>Content</div>
        </TabList>
      </TabProvider>
    );
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveClass('custom-class');
  });
});

describe('Tab', () => {
  it('should render tab label', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="My Tab" value="tab1" />
        </TabList>
      </TabProvider>
    );
    expect(screen.getByText('My Tab')).toBeInTheDocument();
  });

  it('should throw error when used outside TabProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tab label="Tab" value="tab1" />)).toThrow('Tab must be used within TabProvider');
    consoleError.mockRestore();
  });

  it('should apply active styles when selected', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Active Tab" value="tab1" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('dark-green', 'border-[#4a5d3c]');
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('should apply inactive styles when not selected', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Inactive Tab" value="tab2" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('light-neutral', 'border-transparent');
    expect(tab).toHaveAttribute('aria-selected', 'false');
  });

  it('should change active tab on click', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
        </TabList>
      </TabProvider>
    );
    
    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);
    
    expect(screen.getByText('Tab 2').closest('button')).toHaveAttribute('aria-selected', 'true');
  });

  it('should render icon when provided', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab with Icon" value="tab1" icon={<span>🔥</span>} />
        </TabList>
      </TabProvider>
    );
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should apply small size styles', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Small Tab" value="tab1" size="small" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('small-tab');
    expect(screen.getByText('Small Tab')).toHaveClass('text-b2', 'body-semibold');
  });

  it('should apply medium size styles by default', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Medium Tab" value="tab1" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('medium-tab');
    expect(screen.getByText('Medium Tab')).toHaveClass('text-h6');
  });

  it('should apply large size styles', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Large Tab" value="tab1" size="large" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('large-tab');
    expect(screen.getByText('Large Tab')).toHaveClass('text-h4');
  });

  it('should apply custom className', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Custom Tab" value="tab1" className="custom-tab-class" />
        </TabList>
      </TabProvider>
    );
    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('custom-tab-class');
  });
});

describe('TabPanel', () => {
  it('should render content when active', () => {
    render(
      <TabProvider value="tab1">
        <TabPanel value="tab1">
          <div>Active Panel Content</div>
        </TabPanel>
      </TabProvider>
    );
    expect(screen.getByText('Active Panel Content')).toBeInTheDocument();
  });

  it('should not render content when inactive', () => {
    render(
      <TabProvider value="tab1">
        <TabPanel value="tab2">
          <div>Inactive Panel Content</div>
        </TabPanel>
      </TabProvider>
    );
    expect(screen.queryByText('Inactive Panel Content')).not.toBeInTheDocument();
  });

  it('should throw error when used outside TabProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TabPanel value="tab1"><div>Content</div></TabPanel>)).toThrow('TabPanel must be used within TabProvider');
    consoleError.mockRestore();
  });

  it('should apply default classes', () => {
    render(
      <TabProvider value="tab1">
        <TabPanel value="tab1">
          <div>Content</div>
        </TabPanel>
      </TabProvider>
    );
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveClass('pt-2');
  });

  it('should apply custom className', () => {
    render(
      <TabProvider value="tab1">
        <TabPanel value="tab1" className="custom-panel">
          <div>Content</div>
        </TabPanel>
      </TabProvider>
    );
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveClass('custom-panel');
  });
});

describe('Tab Integration', () => {
  it('should switch between tabs and panels', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
        </TabList>
        <TabPanel value="tab1">Panel 1 Content</TabPanel>
        <TabPanel value="tab2">Panel 2 Content</TabPanel>
      </TabProvider>
    );

    expect(screen.getByText('Panel 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2 Content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab 2'));

    expect(screen.queryByText('Panel 1 Content')).not.toBeInTheDocument();
    expect(screen.getByText('Panel 2 Content')).toBeInTheDocument();
  });

  it('should handle multiple tabs with different sizes', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Small" value="tab1" size="small" />
          <Tab label="Medium" value="tab2" size="medium" />
          <Tab label="Large" value="tab3" size="large" />
        </TabList>
      </TabProvider>
    );

    expect(screen.getByText('Small')).toHaveClass('text-b2', 'body-semibold');
    expect(screen.getByText('Medium')).toHaveClass('text-h6');
    expect(screen.getByText('Large')).toHaveClass('text-h4');
  });

  it('should maintain tab state across multiple panel switches', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
          <Tab label="Tab 3" value="tab3" />
        </TabList>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
        <TabPanel value="tab3">Content 3</TabPanel>
      </TabProvider>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab 3'));
    expect(screen.getByText('Content 3')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab 1'));
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
  });

  it('should work with tabs containing icons', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Home" value="tab1" icon={<span data-testid="home-icon">🏠</span>} />
          <Tab label="Profile" value="tab2" icon={<span data-testid="profile-icon">👤</span>} />
        </TabList>
        <TabPanel value="tab1">Home Content</TabPanel>
        <TabPanel value="tab2">Profile Content</TabPanel>
      </TabProvider>
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Profile'));
    expect(screen.getByText('Profile Content')).toBeInTheDocument();
  });

  it('should apply icon size classes based on tab size', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Small" value="tab1" size="small" icon={<span>📝</span>} />
          <Tab label="Medium" value="tab2" size="medium" icon={<span>📝</span>} />
          <Tab label="Large" value="tab3" size="large" icon={<span>📝</span>} />
        </TabList>
      </TabProvider>
    );

    const tabs = screen.getAllByRole('tab');
    const iconSpans = tabs.map(tab => tab.querySelector('span:last-child'));

    expect(iconSpans[0]).toHaveClass('icon-small');
    expect(iconSpans[1]).toHaveClass('icon-medium');
    expect(iconSpans[2]).toHaveClass('icon-large');
  });

  it('should handle external onChange with controlled value', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <TabProvider value="tab1" onChange={handleChange}>
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
        </TabList>
      </TabProvider>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
    expect(handleChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Tab 1'));
    expect(handleChange).toHaveBeenCalledWith('tab1');
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('should apply custom classNames to all components', () => {
    render(
      <TabProvider value="tab1">
        <TabList className="custom-tablist">
          <Tab label="Tab 1" value="tab1" className="custom-tab" />
        </TabList>
        <TabPanel value="tab1" className="custom-panel">
          Content
        </TabPanel>
      </TabProvider>
    );

    expect(screen.getByRole('tablist')).toHaveClass('custom-tablist');
    expect(screen.getByRole('tab')).toHaveClass('custom-tab');
    expect(screen.getByRole('tabpanel')).toHaveClass('custom-panel');
  });

  it('should properly handle aria-selected for accessibility', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
          <Tab label="Tab 2" value="tab2" />
          <Tab label="Tab 3" value="tab3" />
        </TabList>
      </TabProvider>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(tabs[1]);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('should render only active panel content', () => {
    render(
      <TabProvider value="tab2">
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
        <TabPanel value="tab3">Panel 3</TabPanel>
      </TabProvider>
    );

    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    expect(screen.queryByText('Panel 3')).not.toBeInTheDocument();
  });

  it('should maintain focus styles on keyboard navigation', () => {
    render(
      <TabProvider value="tab1">
        <TabList>
          <Tab label="Tab 1" value="tab1" />
        </TabList>
      </TabProvider>
    );

    const tab = screen.getByRole('tab');
    expect(tab).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1', 'focus-visible:ring-black');
  });
});