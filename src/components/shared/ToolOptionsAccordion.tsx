'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ToolOptionsAccordionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export function ToolOptionsAccordion({ 
  title, 
  children, 
  className = '',
  defaultOpen = false
}: ToolOptionsAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`space-y-2 p-4 bg-muted/50 rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left focus:outline-none hover:text-foreground transition-colors rounded-md p-1 -m-1"
      >
        <h3 className="text-sm font-medium">{title}</h3>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ToolOptionsTabsProps {
  title: string;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }>;
  className?: string;
  defaultOpen?: boolean;
}

export function ToolOptionsAccordionTabs({ 
  title, 
  tabs,
  className = '',
  defaultOpen = false 
}: ToolOptionsTabsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className={`space-y-2 p-4 bg-muted/50 rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left focus:outline-none hover:text-foreground transition-colors rounded-md p-1 -m-1"
      >
        <h3 className="text-sm font-medium">{title}</h3>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-2 space-y-2">
          {/* Tab Buttons */}
          <div className="flex bg-muted rounded-md p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors flex-1 justify-center ${
                  activeTab === tab.id 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}

export function ExampleChips({ examples, onExampleSelect, className = '' }: ExampleChipsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-xs font-medium text-muted-foreground">Quick Examples:</div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleSelect(example.value)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-muted hover:bg-muted/80 hover:shadow-sm rounded-full transition-all duration-200 hover:scale-105"
          >
            <span className="font-medium">{example.label}:</span>
            <span className="text-muted-foreground">{example.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ExampleChipsProps {
  examples: Array<{
    label: string;
    value: string;
    description: string;
  }>;
  onExampleSelect: (value: string) => void;
  className?: string;
}