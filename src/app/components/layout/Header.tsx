'use client';

import { Menu, ChevronRight, X, Home, ChevronDown, Info, Mail, Sun, Moon, House, CircleHelp, Type } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
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
      <header className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link 
              href="/"
              className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg px-2 -ml-2"
              aria-label="Text Case Converter Home"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Type className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:block font-semibold text-lg text-foreground transition-colors duration-200">
                Text Case Converter
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {/* Tool Categories including About Us */}
              {allCategories.map((category) => (
                <div
                  key={category}
                  className="relative group"
                  onMouseEnter={() => handleMenuEnter(category)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={category === 'Convert Case' ? '/' : category === 'About Us' ? '/about-us' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span>{category}</span>
                    {toolsByCategory[category]?.length > 0 && (
                      <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:opacity-100" />
                    )}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {hoveredCategory === category && toolsByCategory[category]?.length > 0 && (
                    <div 
                      className={`absolute top-full mt-2 py-2 bg-popover rounded-lg shadow-lg border border-border backdrop-blur-sm ${category === 'About Us' ? 'right-0 min-w-[180px]' : 'left-1/2 -translate-x-1/2'}`}
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
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 whitespace-nowrap"
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
                                  className={`px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 whitespace-nowrap ${tool.custom_style || ''}`}
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

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              
              {/* Mobile Menu Button */}
              <button
                className="relative p-2.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="relative w-5 h-5">
                  <motion.span 
                    animate={{
                      rotate: isMenuOpen ? 45 : 0,
                      y: isMenuOpen ? 6 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-0 w-5 h-0.5 bg-current origin-center"
                  />
                  <motion.span 
                    animate={{
                      opacity: isMenuOpen ? 0 : 1,
                      x: isMenuOpen ? -20 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-2 left-0 w-5 h-0.5 bg-current"
                  />
                  <motion.span 
                    animate={{
                      rotate: isMenuOpen ? -45 : 0,
                      y: isMenuOpen ? -6 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-0 left-0 w-5 h-0.5 bg-current origin-center"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
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
              className="fixed inset-y-0 right-0 z-[70] w-full bg-background shadow-2xl overflow-hidden md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-background border-b border-border">
                <div className="flex items-center justify-between px-4 py-4">
                  <Link
                    href="/"
                    className="flex items-center space-x-3 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
                      <Type className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-base text-foreground">Text Case Converter</span>
                  </Link>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                                                  className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors duration-150"
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
                            className="overflow-hidden bg-accent/30"
                          >
                            <div className="py-1">
                              {toolsByCategory[category].map((tool) => (
                                <Link
                                  key={tool.id}
                                  href={`/tools/${tool.id}`}
                                  className={`block px-6 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150 ${tool.custom_style || ''}`}
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
                <div className="mt-auto border-t border-border">
                  {/* Secondary Navigation */}
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        <Link
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-150 min-w-[40px]"
                        >
                          <House className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>Home</span>
                        </Link>
                        <Link
                          href="/about-us"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-150 min-w-[40px]"
                        >
                          <CircleHelp className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>About</span>
                        </Link>
                        <Link
                          href="/contact-us"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-150 min-w-[40px]"
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
                      <div className="inline-flex items-center bg-accent rounded-full p-1">
                        <button
                          onClick={() => setTheme('light')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            theme === 'light' 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          aria-label="Light mode"
                        >
                          <Sun className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            theme === 'system' 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
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
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
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
                    <p className="text-center text-xs text-muted-foreground/60">
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

