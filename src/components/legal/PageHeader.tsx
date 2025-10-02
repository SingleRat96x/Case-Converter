'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  lastUpdated?: string;
  version?: string;
  effectiveDate?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  lastUpdated,
  version,
  effectiveDate,
  className = ''
}: PageHeaderProps) {
  return (
    <header className={`space-y-6 ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center space-x-2 text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {(lastUpdated || version || effectiveDate) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-l-4 border-muted pl-4">
            {lastUpdated && (
              <div>
                {lastUpdated}
              </div>
            )}
            {version && (
              <div>
                {version}
              </div>
            )}
            {effectiveDate && (
              <div>
                {effectiveDate}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}