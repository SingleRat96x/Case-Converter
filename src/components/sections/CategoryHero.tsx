'use client';

import React from 'react';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { InContentAd } from '@/components/ads/AdPlacements';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CategoryHeroProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  toolCount?: number;
}

export function CategoryHero({ title, description, breadcrumbs, toolCount }: CategoryHeroProps) {
  const { tSync: tCommon } = useCommonTranslations();
  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/60" />
                  )}
                  {item.href ? (
                    <Link 
                      href={item.href}
                      className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
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

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Tool Count Badge */}
          {toolCount !== undefined && (
            <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm">
              {tCommon('category.toolsAvailableBadge').replace('{count}', String(toolCount))}
            </div>
          )}
        </div>

        {/* Horizontal Ad between badge and tools grid */}
        <InContentAd className="mt-12" />
      </div>
    </section>
  );
}