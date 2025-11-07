'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  ChevronRight, 
  Type, 
  Palette, 
  Code2, 
  Image as ImageIcon, 
  BarChart3, 
  Settings,
  Shuffle,
  Star
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { getLocaleFromPathname, type Locale } from '@/lib/i18n';
import { useNavigationTranslations } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

// Types
export type ToolItem = {
  titleKey: string;
  href: string;
  isPopular?: boolean;
};

export type ToolCategory = {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  items: ToolItem[];
};

interface MegaMenuProps {
  categories: ToolCategory[];
}

interface PreviewPanelProps {
  category: ToolCategory | null;
  locale: Locale;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ category, locale }) => {
  const { tSync: t } = useNavigationTranslations();
  
  if (!category) {
    return (
      <div className="mega-menu-preview-empty">
        <p className="text-muted-foreground text-sm">
          {t('navigation.selectCategory')}
        </p>
      </div>
    );
  }

  // Get top 3 tools from the category
  const topTools = category.items.slice(0, 3);
  
  // Category IDs now match the actual slugs
  const categoryHref = locale === 'en' 
    ? `/category/${category.id}` 
    : `/${locale}/category/${category.id}`;

  return (
    <div className="mega-menu-preview">
      <div className="mega-menu-preview-header">
        <h3 className="font-semibold text-sm mb-3">{t(category.titleKey)}</h3>
      </div>
      <div className="mega-menu-preview-items">
        {topTools.map((tool, index) => {
          const toolHref = locale === 'en' ? tool.href : `/${locale}${tool.href}`;
          return (
            <Link
              key={`${tool.href}-${index}`}
              href={toolHref}
              className="mega-menu-preview-item group"
            >
              {tool.isPopular && <Star className="h-3 w-3 text-primary" />}
              <span className="flex-1">{t(tool.titleKey)}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>
      <div className="mega-menu-preview-footer">
        <Link 
          href={categoryHref}
          className="mega-menu-view-all"
        >
          <span>
            {t('navigation.viewAllTools').replace('{{count}}', category.items.length.toString())}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export function MegaMenu({ categories }: MegaMenuProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const { tSync: t } = useNavigationTranslations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [persistentCategory, setPersistentCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get the active category - prefer hovered, then persistent, fallback to selected
  const activeCategory = useMemo(() => {
    // Priority: hovered > persistent > selected by index
    const categoryToShow = hoveredCategory 
      ? categories.find(cat => cat.id === hoveredCategory)
      : persistentCategory
        ? categories.find(cat => cat.id === persistentCategory)
        : categories[selectedCategoryIndex];
    
    return categoryToShow || categories[0] || null;
  }, [hoveredCategory, persistentCategory, selectedCategoryIndex, categories]);

  // Filter tools based on search query
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return categories;
    
    const query = debouncedSearchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      items: category.items.filter(item => 
        t(item.titleKey).toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0);
  }, [debouncedSearchQuery, categories, t]);

  // Reset hover state when categories change (due to search)
  useEffect(() => {
    setHoveredCategory(null);
    setPersistentCategory(null);
    setSelectedCategoryIndex(0);
  }, [debouncedSearchQuery]);

  // Initialize the first category as selected when menu opens
  useEffect(() => {
    if (categories.length > 0 && !hoveredCategory) {
      setSelectedCategoryIndex(0);
    }
  }, [categories, hoveredCategory]);

  // Focus search input when menu becomes visible
  useEffect(() => {
    const checkAndFocus = () => {
      const menuContent = menuRef.current;
      if (menuContent && menuContent.getAttribute('data-state') === 'open') {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };

    // Use MutationObserver to watch for state changes
    const observer = new MutationObserver(checkAndFocus);
    
    if (menuRef.current) {
      observer.observe(menuRef.current, { 
        attributes: true, 
        attributeFilter: ['data-state'] 
      });
    }

    return () => observer.disconnect();
  }, []);

  // Category IDs now match the actual slugs, so we can use them directly
  const getCategorySlug = (categoryId: string): string => {
    return categoryId;
  };

  // Get icon for category
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'text-modification-formatting': <Type className="h-4 w-4" />,
      'social-media-text-generators': <Palette className="h-4 w-4" />,
      'code-data-translation': <Code2 className="h-4 w-4" />,
      'image-tools': <ImageIcon className="h-4 w-4" />,
      'random-generators': <Shuffle className="h-4 w-4" />,
      'analysis-counter-tools': <BarChart3 className="h-4 w-4" />,
      'misc-tools': <Settings className="h-4 w-4" />
    };
    return iconMap[categoryId] || <Settings className="h-4 w-4" />;
  };

  const handleCategoryHover = useCallback((categoryId: string | null, immediate: boolean = false) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (immediate || categoryId === null) {
      // Immediate update for mouse leave or when needed
      setHoveredCategory(categoryId);
      // When hovering over a category, make it persistent
      if (categoryId) {
        setPersistentCategory(categoryId);
      }
    } else {
      // Debounced update for mouse enter to prevent jumpy behavior
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCategory(categoryId);
        // When hovering over a category, make it persistent
        if (categoryId) {
          setPersistentCategory(categoryId);
        }
      }, 100);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="mega-menu-trigger">
            {t('navigation.allTools')}
          </NavigationMenuTrigger>
          <NavigationMenuContent 
            className="mega-menu-content" 
            ref={menuRef}
          >
              <div className="mega-menu-container"
                onMouseLeave={() => {
                  // Reset hover state when leaving the entire menu
                  setHoveredCategory(null);
                }}
              >
                {/* Search Bar */}
                <div className="mega-menu-search">
                  <Search className="mega-menu-search-icon" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('navigation.searchTools')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mega-menu-search-input"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        // Focus first category
                        const firstCategory = document.querySelector('.mega-menu-category-item') as HTMLElement;
                        firstCategory?.focus();
                      }
                    }}
                  />
                </div>

                {/* Main Content Area */}
                <div className="mega-menu-body">
                  {/* Categories List */}
                  <div className="mega-menu-categories">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category, index) => (
                        <button
                          key={category.id}
                          className={cn(
                            "mega-menu-category-item",
                            (hoveredCategory === category.id || 
                             (!hoveredCategory && persistentCategory === category.id) ||
                             (!hoveredCategory && !persistentCategory && selectedCategoryIndex === index)) && 
                            "mega-menu-category-item-active"
                          )}
                          onMouseEnter={() => handleCategoryHover(category.id)}
                          onFocus={() => {
                            setSelectedCategoryIndex(index);
                            handleCategoryHover(category.id, true);
                          }}
                          onClick={() => {
                            const categorySlug = getCategorySlug(category.id);
                            const categoryHref = currentLocale === 'en' 
                              ? `/category/${categorySlug}` 
                              : `/${currentLocale}/category/${categorySlug}`;
                            window.location.href = categoryHref;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              const nextButton = (e.currentTarget.nextElementSibling as HTMLElement);
                              nextButton?.focus();
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              const prevButton = (e.currentTarget.previousElementSibling as HTMLElement);
                              if (prevButton) {
                                prevButton.focus();
                              } else {
                                searchInputRef.current?.focus();
                              }
                            } else if (e.key === 'ArrowRight' || e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              // Focus first tool in preview
                              const firstPreviewItem = document.querySelector('.mega-menu-preview-item') as HTMLElement;
                              firstPreviewItem?.focus();
                            }
                          }}
                        >
                          <span className="mega-menu-category-icon">
                            {getCategoryIcon(category.id)}
                          </span>
                          <span className="mega-menu-category-title">
                            {t(category.titleKey)}
                          </span>
                          <span className="mega-menu-category-count">
                            ({category.items.length})
                          </span>
                          <ChevronRight className="mega-menu-category-arrow" />
                        </button>
                      ))
                    ) : (
                      <div className="mega-menu-no-results">
                        <p className="text-sm text-muted-foreground">
                          {t('navigation.noToolsFound')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Preview Panel */}
                  <div className="mega-menu-divider" />
                  <div onMouseEnter={() => {
                    // Keep the current hover state when entering preview area
                    // This prevents the category from changing when moving to preview
                  }}>
                    <PreviewPanel 
                      category={activeCategory} 
                      locale={currentLocale}
                    />
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}