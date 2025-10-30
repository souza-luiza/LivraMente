'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Context
interface TabContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

interface TabContextProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export const TabProvider: React.FC<TabContextProps> = ({ value, onChange, children }) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabContext.Provider value={{ value: internalValue, onChange: handleChange }}>
      {children}
    </TabContext.Provider>
  );
};

// TabList
interface TabListProps {
  children: ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b-2 border-[#ededed] ${className}`} role="tablist">
      {children}
    </div>
  );
};

// Tab
interface TabProps {
  label: string;
  value: string;
  icon?: ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ 
  label, 
  value, 
  icon, 
  size = 'medium', 
  className = 'rounded-t-lg rounded-b-none' 
}) => {
  const context = useContext(TabContext);
  
  if (!context) {
    throw new Error('Tab must be used within TabProvider');
  }

  const { value: activeValue, onChange } = context;
  const isActive = activeValue === value;

  const textStyles: Record<"small" | "medium" | "large", string> = {
    small:  "text-b2 body-semibold",
    medium: "text-h6",
    large:  "text-h4"
  };

  const iconSizes: Record<"small" | "medium" | "large", string> = {
    small:  "icon-small",
    medium: "icon-medium",
    large:  "icon-large"
  };

  const boxSize: Record<"small" | "medium" | "large", string> = {
    small:  "small-tab",
    medium: "medium-tab",
    large:  "large-tab"
  };

  return (
    <button
      className={`
        ${boxSize[size]} 
        ${isActive ? 'dark-green' : 'light-neutral'}
        border-b-2 
        ${isActive ? 'border-[#4a5d3c]' : 'border-transparent'}
        rounded-t-lg rounded-b-none
        active:opacity-95
        hover:opacity-90 hover:cursor-pointer
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black
        transition-all
        ${className}
      `}
      onClick={() => onChange(value)}
      role="tab"
      aria-selected={isActive}
    >
      <span className={`${textStyles[size]}`}>{label}</span>
      {icon && <span className={`${iconSizes[size]}`}>{icon}</span>}
    </button>
  );
};

// TabPanel
interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '' }) => {
  const context = useContext(TabContext);
  
  if (!context) {
    throw new Error('TabPanel must be used within TabProvider');
  }

  const { value: activeValue } = context;
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div className={`pt-6 ${className}`} role="tabpanel">
      {children}
    </div>
  );
};