'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { loadNamespace } from '@/lib/i18n/loader';
import { Layout } from '@/components/layout/Layout';
import { CategoryHero } from '@/components/sections/CategoryHero';
import { CategoryGrid } from '@/components/sections/CategoryGrid';

interface CategoryTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CategoryPageProps {
  categorySlug: string;
  tools: CategoryTool[];
  customTitle?: string;
  customDescription?: string;
  breadcrumbs?: BreadcrumbItem[];
}

interface CategoryTranslations {
  title: string;
  metaDescription: string;
  sections: {
    intro: {
      title: string;
      content: string;
    };
    toolsList: {
      title: string;
      items: Array<{
        name: string;
        href: string;
        description: string;
      }>;
    };
  };
}

export function CategoryPage({ 
  categorySlug, 
  tools, 
  customTitle, 
  customDescription,
  breadcrumbs 
}: CategoryPageProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const [translations, setTranslations] = useState<CategoryTranslations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        const data = await loadNamespace(`tools/seo-content/${categorySlug}` as 'shared/common', currentLocale);
        setTranslations(data as unknown as CategoryTranslations);
      } catch (error) {
        console.warn(`Failed to load translations for category ${categorySlug}:`, error);
        // Fallback to props if translation loading fails
        setTranslations({
          title: customTitle || 'Category Page',
          metaDescription: customDescription || 'Category description',
          sections: {
            intro: {
              title: customTitle || 'Category Page',
              content: customDescription || 'Category description'
            },
            toolsList: {
              title: 'Available Tools',
              items: tools.map(tool => ({
                name: tool.title,
                href: tool.href,
                description: tool.description
              }))
            }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [categorySlug, currentLocale, customTitle, customDescription, tools]);

  // Default breadcrumbs if none provided
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { 
      label: currentLocale === 'ru' ? 'Главная' : currentLocale === 'de' ? 'Startseite' : 'Home', 
      href: currentLocale === 'en' ? '/' : `/${currentLocale}` 
    },
    { 
      label: currentLocale === 'ru' ? 'Все Инструменты' : currentLocale === 'de' ? 'Alle Werkzeuge' : 'All Tools', 
      href: currentLocale === 'en' ? '/tools' : `/${currentLocale}/tools` 
    },
    { label: translations?.title || customTitle || 'Category' }
  ];

  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!translations) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground">The requested category could not be loaded.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        title={translations.sections.intro.title}
        description={translations.sections.intro.content}
        breadcrumbs={finalBreadcrumbs}
        toolCount={tools.length}
      />

      {/* Tools Grid Section */}
      <CategoryGrid
        title={translations.sections.toolsList.title}
        tools={tools}
        className="bg-muted/30"
      />

      {/* Additional Content Sections can be added here */}
    </Layout>
  );
}