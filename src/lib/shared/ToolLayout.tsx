'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

interface TextAreaSectionProps {
  title: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

interface ActionSectionProps {
  children: ReactNode;
}

interface StatsSectionProps {
  children: ReactNode;
}

export function ToolLayout({
  children,
  title,
  description,
  className = '',
}: ToolLayoutProps) {
  return (
    <div className={`w-full space-y-8 ${className}`}>
      {title && (
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function TextAreaSection({
  title,
  value,
  onChange,
  placeholder = 'Type or paste your text here...',
  readOnly = false,
  className = '',
}: TextAreaSectionProps) {
  return (
    <Card className={`w-full tool-card-vibrant ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground gradient-text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <textarea
          className={`w-full min-h-[200px] p-5 tool-input-enhanced text-foreground placeholder:text-muted-foreground resize-none ${
            readOnly ? 'bg-muted/50 cursor-default' : 'bg-background/80'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}

export function ActionSection({ children }: ActionSectionProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      {children}
    </div>
  );
}

export function StatsSection({ children }: StatsSectionProps) {
  return (
    <Card className="w-full tool-card-vibrant">
      <CardContent className="pt-6 pb-6">
        <div className="stats-grid">{children}</div>
      </CardContent>
    </Card>
  );
}

export function SingleColumnLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

// Keep TwoColumnLayout for specific cases but make it more responsive
export function TwoColumnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{children}</div>
  );
}

// NEW LAYOUT COMPONENTS FOR STAGE 1.2

// Input/Output Grid Layout for text processors
export function InputOutputGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {children}
    </div>
  );
}

// Configuration + Output Layout for generators and converters with settings
export function ConfigOutputLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
      {children}
    </div>
  );
}

// Image Processing Layout for image tools
export function ImageProcessingLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6 w-full">{children}</div>;
}

// Three Column Layout for complex tools
export function ThreeColumnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {children}
    </div>
  );
}

// Centered Column Layout for generators
export function CenteredColumnLayout({
  children,
  maxWidth = 'max-w-2xl',
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className={`mx-auto w-full ${maxWidth} space-y-6`}>{children}</div>
  );
}

// Full Width Layout for tools that need maximum space
export function FullWidthLayout({ children }: { children: ReactNode }) {
  return <div className="w-full space-y-6">{children}</div>;
}

// Split Layout with Sidebar for tools with extensive settings
export function SplitLayout({
  sidebar,
  main,
}: {
  sidebar: ReactNode;
  main: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
      <div className="lg:col-span-1">{sidebar}</div>
      <div className="lg:col-span-3">{main}</div>
    </div>
  );
}

// Tab-based Layout for tools with multiple modes
export function TabLayout({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  );
}

// Responsive Grid Layout for tools with multiple outputs
export function ResponsiveGridLayout({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 w-full`}>
      {children}
    </div>
  );
}

// Masonry Layout for variable height content
export function MasonryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {children}
    </div>
  );
}
