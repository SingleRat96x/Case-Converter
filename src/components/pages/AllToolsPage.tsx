'use client';

import React, { useState, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/i18n';
import { useNavigationTranslations } from '@/lib/i18n/hooks';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { WidePageAd } from '@/components/ads/AdPlacements';

// Types
interface Tool {
  id: string;
  titleKey: string;
  href: string;
  icon?: string;
  isPopular?: boolean;
}

interface ToolCategory {
  id: string;
  slug: string;
  titleKey: string;
  descriptionKey?: string;
  icon: React.ReactNode;
  tools: Tool[];
}

interface AllToolsPageProps {
  categories: ToolCategory[];
}

// Tool Card Component with description
const ToolCard: React.FC<{ 
  tool: Tool & { description?: string }; 
  locale: 'en' | 'ru';
}> = ({ tool, locale }) => {
  const { tSync: t } = useNavigationTranslations();
  const toolHref = locale === 'en' ? tool.href : `/ru${tool.href}`;
  
  // Generate description based on tool
  const getDescription = () => {
    if (tool.description) return tool.description;
    const toolName = t(tool.titleKey);
    if (locale === 'en') {
      return `Transform and convert text using our ${toolName.toLowerCase()} tool`;
    }
    return `Преобразуйте текст с помощью инструмента ${toolName.toLowerCase()}`;
  };
  
  return (
    <Link
      href={toolHref}
      className={cn(
        "group relative flex flex-col",
        "p-6 rounded-lg border bg-card text-card-foreground",
        "transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
        "hover:border-primary/50 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "h-full"
      )}
    >
      {tool.isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
            ⭐ Popular
          </span>
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-3">
        <div className="text-3xl flex-shrink-0">
          {tool.icon || '🔧'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1">
            {t(tool.titleKey)}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {getDescription()}
          </p>
        </div>
      </div>
      
      <div className="mt-auto pt-2">
        <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-1">
          {t('navigation.useToolCta')}
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

// Category Section Component
const CategorySection: React.FC<{
  category: ToolCategory;
  locale: 'en' | 'ru';
  searchQuery: string;
}> = ({ category, locale, searchQuery }) => {
  const { tSync: t } = useNavigationTranslations();
  const categoryHref = locale === 'en' 
    ? `/category/${category.slug}` 
    : `/ru/category/${category.slug}`;
  
  // Filter tools based on search
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return category.tools;
    
    const query = searchQuery.toLowerCase();
    return category.tools.filter(tool =>
      t(tool.titleKey).toLowerCase().includes(query)
    );
  }, [searchQuery, category.tools, t]);
  
  // Don't show category if no tools match search
  if (filteredTools.length === 0) return null;
  
  // Show only first 5 tools, unless searching
  const displayedTools = searchQuery ? filteredTools : filteredTools.slice(0, 5);
  const remainingCount = filteredTools.length - 5;
  const hasMore = !searchQuery && remainingCount > 0;
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 pb-3 border-b">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl flex-shrink-0">{category.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold truncate">
                {t(category.titleKey)}
              </h2>
              {/* Mobile: Show as part of subtitle */}
              <Link 
                href={categoryHref}
                className="sm:hidden text-primary hover:text-primary/80 transition-colors"
                aria-label={t('navigation.seeAllTools')}
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {t('navigation.toolsAvailableShort').replace('{{count}}', filteredTools.length.toString())}
              </span>
              <span className="hidden sm:inline">•</span>
              <Link 
                href={categoryHref}
                className="hidden sm:inline-flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                {t('navigation.seeAll')}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Desktop: Show as separate link */}
        <Link 
          href={categoryHref}
          className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors flex-shrink-0 ml-4"
        >
          <span>{t('navigation.seeAllTools')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTools.map((tool) => (
          <ToolCard 
            key={tool.id} 
            tool={tool} 
            locale={locale}
          />
        ))}
        
        {/* Show More Tools Card */}
        {hasMore && (
          <Link
            href={categoryHref}
            className={cn(
              "group relative flex flex-col items-center justify-center",
              "p-6 rounded-lg border-2 border-dashed border-muted-foreground/20",
              "bg-gradient-to-br from-muted/30 to-muted/10",
              "transition-all duration-200 hover:border-primary/50",
              "hover:shadow-lg hover:-translate-y-1",
              "hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10",
              "min-h-[120px]"
            )}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                +{remainingCount}
              </div>
              <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {t('navigation.toolsAvailableShort').replace('{{count}}', remainingCount.toString())}
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-primary">
                <span className="text-sm font-medium">
                  {t('navigation.seeAll')}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
};

export function AllToolsPage({ categories }: AllToolsPageProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const { tSync: t } = useNavigationTranslations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Calculate total tools count
  const totalTools = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.tools.length, 0);
  }, [categories]);
  
  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return categories;
    
    const query = debouncedSearchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      tools: category.tools.filter(tool =>
        t(tool.titleKey).toLowerCase().includes(query)
      )
    })).filter(category => category.tools.length > 0);
  }, [debouncedSearchQuery, categories, t]);
  
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 -mt-8 mb-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.03] dark:bg-grid-slate-700/[0.03]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('navigation.professionalTools').replace('{{count}}', totalTools.toString())}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('navigation.yourCompleteToolkit')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('navigation.toolsPageDescription')}
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-70" />
              <div className="relative bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center px-6 py-4">
                  <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('navigation.searchAllTools').replace('{{count}}', totalTools.toString())}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground/60 px-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-3 p-1.5 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Results Count */}
            {debouncedSearchQuery && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium">
                  {t('navigation.toolsFound').replace('{{count}}', 
                    filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0).toString()
                  )}
                </p>
              </div>
            )}
            
            {/* Quick Stats */}
            {!debouncedSearchQuery && (
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">{t('navigation.categories')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalTools}</div>
                  <div className="text-sm text-muted-foreground">{t('navigation.totalTools')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">{t('navigation.free')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">{t('navigation.available')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tools Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Space for auto ads */}
        <div className="my-8"></div>
        
        {filteredCategories.map((category, index) => (
          <React.Fragment key={category.id}>
            {/* Wide ads before specific sections */}
            {(index === 0 || index === 2 || index === 4 || index === 6) && (
              <WidePageAd slot="4917772104" />
            )}
            
            <CategorySection
              category={category}
              locale={currentLocale}
              searchQuery={debouncedSearchQuery}
            />
            
            {/* Space for auto ads between categories */}
            {(index + 1) % 2 === 0 && index < filteredCategories.length - 1 && (
              <div className="my-12"></div>
            )}
          </React.Fragment>
        ))}
        
        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {t('navigation.noToolsFoundMessage')}
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              variant="outline"
              className="mt-4"
            >
              {t('navigation.clearSearch')}
            </Button>
          </div>
        )}
        
        {/* Space for auto ads at bottom */}
        <div className="mt-12"></div>
      </div>
    </Layout>
  );
}