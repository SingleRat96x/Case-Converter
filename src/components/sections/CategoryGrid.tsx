'use client';

import React from 'react';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { ToolCard } from '@/components/tools/ToolCard';

interface CategoryTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface CategoryGridProps {
  title: string;
  tools: CategoryTool[];
  className?: string;
}

export function CategoryGrid({ title, tools, className = '' }: CategoryGridProps) {
  const { tSync: tCommon } = useCommonTranslations();
  return (
    <section className={`py-16 bg-background ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
            />
          ))}
        </div>

        {/* Tools Count Info */}
        {tools.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">{tCommon('category.toolsListSummary').replace('{count}', String(tools.length))}</p>
          </div>
        )}
      </div>
    </section>
  );
}