import React from 'react';
import { themeClasses, cn } from '@/lib/theme-config';

interface TextToolLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: keyof typeof themeClasses.container;
  spacing?: keyof typeof themeClasses.section.spacing;
}

export function TextToolLayout({
  children,
  title,
  description,
  maxWidth = 'md',
  spacing = 'md'
}: TextToolLayoutProps) {
  return (
    <div className={cn(themeClasses.container[maxWidth], themeClasses.section.spacing[spacing])}>
      {(title || description) && (
        <div className="text-center mb-8">
          {title && (
            <h1 className={themeClasses.heading.h1}>
              {title}
            </h1>
          )}
          {description && (
            <p className={cn(themeClasses.description, 'mt-2 max-w-2xl mx-auto')}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}