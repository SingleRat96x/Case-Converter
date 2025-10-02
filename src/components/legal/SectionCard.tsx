'use client';

import React, { useState } from 'react';
import { ChevronDown, Hash } from 'lucide-react';

interface SectionCardProps {
  id?: string;
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  level?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export function SectionCard({
  id,
  title,
  summary,
  children,
  defaultExpanded = true,
  collapsible = false,
  level = 'h2',
  className = ''
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const copyLinkToClipboard = () => {
    if (id) {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url).then(() => {
        // Could show a toast notification here
      });
    }
  };

  const HeaderComponent = level === 'h3' ? 'h3' : level === 'h4' ? 'h4' : 'h2';
  const headerClasses = {
    h2: 'text-2xl md:text-3xl',
    h3: 'text-xl md:text-2xl',
    h4: 'text-lg md:text-xl'
  };

  return (
    <section className={`scroll-mt-20 ${className}`} id={id}>
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <HeaderComponent
              className={`group flex items-center gap-2 ${headerClasses[level]} font-bold tracking-tight mb-4`}
            >
              {title}
              {id && (
                <button
                  onClick={copyLinkToClipboard}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  aria-label={`Copy link to ${title} section`}
                  title="Copy link to this section"
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </HeaderComponent>
            
            {summary && (
              <p className="mb-6 text-muted-foreground leading-relaxed text-lg">
                {summary}
              </p>
            )}
          </div>
          
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-2 hover:bg-muted rounded-md transition-colors"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        
        <div
          className={`transition-all duration-200 ease-in-out ${
            collapsible && !isExpanded 
              ? 'max-h-0 overflow-hidden opacity-0' 
              : 'max-h-none opacity-100'
          }`}
        >
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}