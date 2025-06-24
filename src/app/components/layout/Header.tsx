'use client';

import {
  Menu,
  ChevronRight,
  X,
  Home,
  ChevronDown,
  Mail,
  Info,
} from 'lucide-react';
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
  text_transform?:
    | 'none'
    | 'uppercase'
    | 'lowercase'
    | 'capitalize'
    | 'alternating';
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

  useEffect(() => {
    const fetchTools = async () => {
      const { data } = await supabase.from('tools').select('*').order('title');
      if (data) setTools(data);
    };
    fetchTools();
  }, []);

  // Better mobile menu body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      setExpandedCategories([]);
    }
  }, [isMenuOpen]);

  const allCategories = [
    ...Object.values(TOOL_CATEGORIES),
    'About Us',
  ] as const;
  const aboutUsTools: MenuItem[] = [
    {
      id: 'contact-us',
      name: 'Contact Us',
      category: 'About Us',
      title: 'Contact Us',
    },
  ];

  const toolsByCategory = tools.reduce(
    (acc, tool) => {
      const category = tool.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        id: tool.id,
        name: tool.name,
        category,
        title: tool.title,
        display_name: tool.display_name,
        text_transform: tool.text_transform,
        custom_style: tool.custom_style,
        short_description: tool.short_description,
        long_description: tool.long_description,
        updated_at: tool.updated_at,
        show_in_index: tool.show_in_index,
      });
      return acc;
    },
    { 'About Us': aboutUsTools } as Record<string, MenuItem[]>
  );

  const getDisplayText = (tool: MenuItem) => {
    let text = tool.display_name || tool.title;
    switch (tool.text_transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text
          .split(' ')
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');
      case 'alternating':
        return text
          .split('')
          .map((char, i) =>
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join('');
      default:
        return text;
    }
  };

  const getColumnCount = (tools: MenuItem[]) => {
    if (tools.length <= 8) return 1;
    if (tools.length <= 16) return 2;
    if (tools.length <= 24) return 3;
    return 4;
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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Link
              className="flex items-center hover:scale-105 transition-transform duration-200"
              href="/"
            >
              <span className="font-bold text-sm 2xs:text-base xs:text-lg sm:text-lg md:text-base lg:text-lg whitespace-nowrap text-foreground hover:text-primary transition-colors duration-200">
                Text Case Converter
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center px-2 lg:px-4">
            {allCategories.map(category => (
              <div
                key={category}
                className="relative group whitespace-nowrap"
                onMouseEnter={() => handleMenuEnter(category)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={
                    category === 'Convert Case'
                      ? '/'
                      : category === 'About Us'
                        ? '/about-us'
                        : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                  }
                  className="relative flex items-center px-3 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                >
                  <span className="relative z-10">
                    {category}
                    {toolsByCategory[category]?.length > 0 && (
                      <ChevronDown className="inline-block h-3 w-3 md:h-4 md:w-4 ml-1 opacity-60 group-hover:opacity-100 transition-all duration-200" />
                    )}
                  </span>
                </Link>
                {hoveredCategory === category &&
                  toolsByCategory[category]?.length > 0 && (
                    <div
                      className={`absolute top-full mt-2 py-3 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-xl ${category === 'About Us' ? 'right-0 min-w-[200px]' : 'left-1/2 -translate-x-1/2'}`}
                      onMouseEnter={() => handleMenuEnter(category)}
                      onMouseLeave={handleMenuLeave}
                      style={
                        category !== 'About Us'
                          ? {
                              maxWidth: 'min(900px, 90vw)',
                              width: `${Math.min(getColumnCount(toolsByCategory[category]) * 240, 900)}px`,
                            }
                          : undefined
                      }
                    >
                      <div
                        className={`${category !== 'About Us' ? 'grid gap-x-3 px-3' : 'px-3'}`}
                        style={
                          category !== 'About Us'
                            ? {
                                gridTemplateColumns: `repeat(${getColumnCount(toolsByCategory[category])}, minmax(0, 1fr))`,
                              }
                            : undefined
                        }
                      >
                        {category === 'About Us'
                          ? toolsByCategory[category].map(tool => (
                              <Link
                                key={tool.id}
                                href={`/${tool.id.toLowerCase().replace(/_/g, '-')}`}
                                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-md transform hover:translate-x-1"
                              >
                                {tool.name}
                              </Link>
                            ))
                          : splitIntoColumns(
                              toolsByCategory[category],
                              getColumnCount(toolsByCategory[category])
                            ).map((columnTools, columnIndex) => (
                              <div
                                key={columnIndex}
                                className="flex flex-col space-y-1"
                              >
                                {columnTools.map(tool => (
                                  <Link
                                    key={tool.id}
                                    href={`/tools/${tool.id}`}
                                    className={`px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-md transform hover:translate-x-1 ${tool.custom_style || ''}`}
                                  >
                                    {getDisplayText(tool)}
                                  </Link>
                                ))}
                              </div>
                            ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              className="p-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-16"></div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col h-full min-h-0">
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
                  {Object.values(TOOL_CATEGORIES).map(category => (
                    <div key={category}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                        <Link
                          href={
                            category === 'Convert Case'
                              ? '/'
                              : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                          }
                          className="flex-1 text-base font-medium text-gray-900 dark:text-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category}
                        </Link>
                        {toolsByCategory[category]?.length > 0 && (
                          <button
                            onClick={e => toggleCategory(category, e)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                          >
                            <motion.div
                              animate={{
                                rotate: expandedCategories.includes(category)
                                  ? 90
                                  : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedCategories.includes(category) &&
                          toolsByCategory[category]?.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 ml-4 space-y-1">
                                {toolsByCategory[category].map(tool => (
                                  <Link
                                    key={tool.id}
                                    href={`/tools/${tool.id}`}
                                    className={`block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${tool.custom_style || ''}`}
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

                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 space-y-2">
                  <Link
                    href="/about-us"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      About Us
                    </span>
                  </Link>

                  <Link
                    href="/contact-us"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Contact Us
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
