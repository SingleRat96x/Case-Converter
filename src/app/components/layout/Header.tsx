'use client';

import { Menu, ChevronRight, X, Home, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TOOL_CATEGORIES } from '@/lib/tools';
import type { ToolContent } from '@/lib/tools';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  title: string;
  display_name?: string;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'alternating';
  custom_style?: string;
  short_description?: string;
  long_description?: string;
  updated_at?: string;
  show_in_index?: boolean;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolContent[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      const { data } = await supabase.from('tools').select('*').order('title');
      if (data) setTools(data);
    };
    fetchTools();
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY.replace('-', '').replace('px', '')));
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      setExpandedCategories([]);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      // Focus the close button when the drawer opens
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false);
        }
        if (e.key === 'Tab') {
          // Simple focus trap inside the drawer
          const container = drawerRef.current;
          if (!container) return;
          const focusable = container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey) {
            if (active === first || !container.contains(active)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (active === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMenuOpen]);

  const allCategories = [...Object.values(TOOL_CATEGORIES), 'About Us'] as const;
  const aboutUsTools: MenuItem[] = [{
    id: 'contact-us',
    name: 'Contact Us',
    category: 'About Us',
    title: 'Contact Us',
  }];
  
  const toolsByCategory: Record<string, MenuItem[]> = {
    ...tools.reduce((acc, tool) => {
      const category = tool.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      const menuItem: MenuItem = {
        id: tool.id,
        name: tool.name,
        title: tool.title,
        display_name: tool.display_name,
        category,
        text_transform: tool.text_transform,
        custom_style: tool.custom_style,
        short_description: tool.short_description,
        long_description: tool.long_description,
        updated_at: tool.updated_at,
        show_in_index: tool.show_in_index
      };
      acc[category].push(menuItem);
      return acc;
    }, {} as Record<string, MenuItem[]>),
    'About Us': aboutUsTools
  };

  const getDisplayText = (item: MenuItem) => {
    let text = item.display_name || item.title;
    
    switch (item.text_transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      case 'alternating':
        return text.split('').map((char: string, i: number) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
      default:
        return text;
    }
  };

  const getColumnCount = (categoryTools: MenuItem[]) => {
    if (categoryTools.length <= 7) return 1;
    if (categoryTools.length <= 14) return 2;
    return 3;
  };

  const splitIntoColumns = (tools: MenuItem[], columnCount: number) => {
    const itemsPerColumn = Math.ceil(tools.length / columnCount);
    return Array.from({ length: columnCount }, (_, i) =>
      tools.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
    );
  };

  const closeTimeout = useRef<NodeJS.Timeout>();
  
  const handleMenuEnter = (category: string) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setHoveredCategory(category);
  };

  const handleMenuLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 100);
  };

  const toggleCategory = (category: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 theme-transition">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Link className="flex items-center" href="/">
              <Home className="h-6 w-6 text-primary md:hidden" />
              <span className="font-bold text-sm 2xs:text-base xs:text-lg sm:text-lg md:text-base lg:text-lg whitespace-nowrap">
                <span className="relative z-10 text-gray-900 dark:text-white transition-all duration-300 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                  Text Case Converter
                </span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 flex-1 justify-center px-1 sm:px-2 lg:px-4">
            {/* Tool Categories including About Us */}
            {allCategories.map((category) => (
              <div
                key={category}
                className="relative group whitespace-nowrap"
                onMouseEnter={() => handleMenuEnter(category)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={category === 'Convert Case' ? '/' : category === 'About Us' ? '/about-us' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="flex items-center py-2 text-xs md:text-[13px] lg:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary rounded-md transition-all duration-200 ease-in-out relative group/item"
                >
                  <span className="relative z-10">
                    {category}
                    {toolsByCategory[category]?.length > 0 && (
                      <ChevronDown className="inline-block h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 ml-1 opacity-50 group-hover/item:opacity-100 transition-all duration-200 ease-in-out transform group-hover/item:translate-y-0.5" />
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-md opacity-0 group-hover/item:opacity-10 transition-all duration-200 ease-in-out transform scale-90 group-hover/item:scale-100"></span>
                </Link>
                {hoveredCategory === category && toolsByCategory[category]?.length > 0 && (
                  <div 
                    className={`absolute top-full mt-1 py-2 bg-white/95 dark:bg-gray-900/95 rounded-md shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-2xl backdrop-saturate-150 ${category === 'About Us' ? 'right-0 min-w-[180px]' : 'left-1/2 -translate-x-1/2'}`}
                    onMouseEnter={() => handleMenuEnter(category)}
                    onMouseLeave={handleMenuLeave}
                    style={category !== 'About Us' ? { 
                      maxWidth: 'min(880px, 90vw)',
                      width: `${Math.min(getColumnCount(toolsByCategory[category]) * 220, 880)}px`
                    } : undefined}
                  >
                    <div className={`${category !== 'About Us' ? 'grid gap-x-2 px-2' : 'px-2'}`}
                         style={category !== 'About Us' ? { 
                           gridTemplateColumns: `repeat(${getColumnCount(toolsByCategory[category])}, minmax(0, 1fr))`
                         } : undefined}>
                      {category === 'About Us' ? (
                        toolsByCategory[category].map((tool) => (
                          <Link
                            key={tool.id}
                            href={`/${tool.id.toLowerCase().replace(/_/g, '-')}`}
                            className="block px-4 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:shadow-md whitespace-nowrap"
                          >
                            {tool.name}
                          </Link>
                        ))
                      ) : (
                        splitIntoColumns(toolsByCategory[category], getColumnCount(toolsByCategory[category])).map((columnTools, columnIndex) => (
                          <div key={columnIndex} className="flex flex-col">
                            {columnTools.map((tool) => (
                              <Link
                                key={tool.id}
                                href={`/tools/${tool.id}`}
                                className={`px-4 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:shadow-md whitespace-nowrap ${tool.custom_style || ''}`}
                              >
                                {getDisplayText(tool)}
                              </Link>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 theme-transition md:hidden group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute top-0.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute bottom-0.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>
      <div className="h-16"></div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] md:hidden bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Mobile Menu Drawer */}
            <motion.div 
              ref={drawerRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 26, 
                stiffness: 260,
                mass: 0.8
              }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200/50 dark:border-gray-800/50">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TC</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">Text Converter</span>
                  </Link>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation */}
              <div className="h-[calc(100%-64px)] overflow-y-auto overflow-x-hidden overscroll-contain">
                <nav className="px-4 py-4 space-y-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {/* Home Link */}
                  <Link
                    href="/"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    Home
                  </Link>

                  <div className="my-4 border-t border-gray-200/50 dark:border-gray-800/50"></div>

                  {/* Tool Categories */}
                  {Object.values(TOOL_CATEGORIES).map((category) => (
                    <div key={category} className="relative">
                      <div className="flex items-center">
                        <Link
                          href={category === 'Convert Case' ? '/' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          className="flex-1 flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-l-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category}
                        </Link>
                        {toolsByCategory[category]?.length > 0 && (
                          <button
                            onClick={(e) => toggleCategory(category, e)}
                            className={`px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-r-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                              expandedCategories.includes(category) ? 'bg-gray-100 dark:bg-gray-800' : ''
                            }`}
                            aria-label={`Toggle ${category} submenu`}
                            aria-expanded={expandedCategories.includes(category)}
                          >
                            <motion.div
                              animate={{ rotate: expandedCategories.includes(category) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.div>
                          </button>
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {expandedCategories.includes(category) && toolsByCategory[category]?.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 mt-1 space-y-0.5 pb-2">
                              {toolsByCategory[category].map((tool) => (
                                <Link
                                  key={tool.id}
                                  href={`/tools/${tool.id}`}
                                  className={`block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${tool.custom_style || ''}`}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {getDisplayText(tool)}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className="my-4 border-t border-gray-200/50 dark:border-gray-800/50"></div>

                  {/* About Section */}
                  <div className="relative">
                    <div className="flex items-center">
                      <Link
                        href="/about-us"
                        className="flex-1 flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-l-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About
                      </Link>
                      <button
                        onClick={(e) => toggleCategory('About Us', e)}
                        className={`px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-r-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                          expandedCategories.includes('About Us') ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        aria-label="Toggle About submenu"
                        aria-expanded={expandedCategories.includes('About Us')}
                      >
                        <motion.div
                          animate={{ rotate: expandedCategories.includes('About Us') ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </motion.div>
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {expandedCategories.includes('About Us') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-1 space-y-0.5 pb-2">
                            <Link
                              href="/contact-us"
                              className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Contact Us
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-8 px-4 pb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                      <p>© 2024 Text Case Converter</p>
                      <p>Professional text transformation tools</p>
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

