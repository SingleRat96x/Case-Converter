'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { useOtherToolsTranslations } from '@/lib/i18n/hooks';
import { loadNamespace } from '@/lib/i18n/loader';
import { OtherToolsTranslations } from '@/lib/i18n/types';
import { ToolCard } from '@/components/tools/ToolCard';

export function OtherTools() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const { tSync: t } = useOtherToolsTranslations();
  const [toolsData, setToolsData] = useState<OtherToolsTranslations | null>(null);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const data = await loadNamespace('tools/other-tools', currentLocale);
        setToolsData(data);
      } catch (error) {
        console.warn('Failed to load other-tools data:', error);
      }
    };
    
    loadTools();
  }, [currentLocale]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            {t('section.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('section.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData?.tools?.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              isPopular={tool.isPopular}
              isViewAll={tool.isViewAll}
            />
          )) || null}
        </div>
      </div>
    </section>
  );
}
