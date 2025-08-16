'use client';

import { Menu, ChevronRight, X, Home, ChevronDown, Info, Mail, Sun, Moon, House, CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TOOL_CATEGORIES } from '@/lib/tools';
import type { ToolContent } from '@/lib/tools';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();

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
                <span className="relative z-10 text-gray-900 dark:text-white transition-all duration-300 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 dark:from-orange-400 dark:via-red-400 dark:to-amber-400">
                  Text Case Converter
                </span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-100/50 via-red-100/50 to-amber-100/50 dark:from-orange-900/30 dark:via-red-900/30 dark:to-amber-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
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
                            className="block px-4 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 dark:hover:from-orange-400 dark:hover:to-red-500 rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:shadow-md whitespace-nowrap"
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
                                className={`px-4 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 dark:hover:from-orange-400 dark:hover:to-red-500 rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:shadow-md whitespace-nowrap ${tool.custom_style || ''}`}
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
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
                          <button
                className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 theme-transition md:hidden group"
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
              className="fixed inset-y-0 right-0 z-[70] w-full bg-white dark:bg-gray-900 shadow-2xl overflow-hidden md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between px-4 py-4">
                  <Link
                    href="/"
                    className="flex items-center space-x-2.5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TC</span>
                    </div>
                    <span className="font-semibold text-base text-gray-900 dark:text-white">Text Case Converter</span>
                  </Link>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="h-[calc(100%-73px)] overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col">
                {/* Main Navigation */}
                <nav className="flex-1 pt-2 pb-4">
                  {Object.values(TOOL_CATEGORIES).map((category) => (
                    <div key={category} className="relative">
                      <button
                        onClick={(e) => {
                          if (toolsByCategory[category]?.length > 0) {
                            toggleCategory(category, e);
                          } else {
                            // Navigate to category page if no subtools
                            window.location.href = category === 'Convert Case' ? '/' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                            setIsMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <span className="text-left">{category}</span>
                        {toolsByCategory[category]?.length > 0 && (
                          <motion.div
                            animate={{ rotate: expandedCategories.includes(category) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedCategories.includes(category) && toolsByCategory[category]?.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/30"
                          >
                            <div className="py-1">
                              {toolsByCategory[category].map((tool) => (
                                <Link
                                  key={tool.id}
                                  href={`/tools/${tool.id}`}
                                  className={`block px-6 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ${tool.custom_style || ''}`}
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
                </nav>

                {/* Footer Section */}
                <div className="mt-auto border-t border-gray-200/50 dark:border-gray-700/50">
                  {/* Secondary Navigation */}
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        <Link
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-150 min-w-[40px]"
                        >
                          <House className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>Home</span>
                        </Link>
                        <Link
                          href="/about-us"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-150 min-w-[40px]"
                        >
                          <CircleHelp className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>About</span>
                        </Link>
                        <Link
                          href="/contact-us"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-150 min-w-[40px]"
                        >
                          <Mail className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>Contact</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Theme Switcher */}
                  <div className="px-4 pb-4 pt-2">
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                        <button
                          onClick={() => setTheme('light')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            theme === 'light' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                          aria-label="Light mode"
                        >
                          <Sun className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            theme === 'system' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                          aria-label="System theme"
                        >
                          <svg className="h-4 w-4" strokeWidth={1.5} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            theme === 'dark' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                          aria-label="Dark mode"
                        >
                          <Moon className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                      © 2024 Text Case Converter
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

