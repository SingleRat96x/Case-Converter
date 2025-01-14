'use client';

import { Menu, ChevronRight, X, Home, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { TOOL_CATEGORIES } from '@/lib/tools';
import type { ToolContent } from '@/lib/tools';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      setExpandedCategories([]);
    }
  }, [isMenuOpen]);

  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, ToolContent[]>);

  const getColumnCount = (categoryTools: ToolContent[]) => {
    if (categoryTools.length <= 7) return 1;
    if (categoryTools.length <= 14) return 2;
    return 3;
  };

  const splitIntoColumns = (tools: ToolContent[], columnCount: number) => {
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
              <span className="font-bold text-sm 2xs:text-base xs:text-lg sm:text-lg md:text-base lg:text-lg xl:text-xl 2xl:text-2xl group relative px-2 sm:px-3 py-1">
                <span className="relative z-10 text-gray-900 dark:text-white transition-all duration-300 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                  Text Case Converter
                </span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 flex-1 justify-center px-1 sm:px-2 lg:px-4">
            {/* Tool Categories */}
            {Object.values(TOOL_CATEGORIES).map((category) => (
              <div
                key={category}
                className="relative group whitespace-nowrap"
                onMouseEnter={() => handleMenuEnter(category)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={category === 'Convert Case' ? '/' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="flex items-center py-2 text-xs md:text-[13px] lg:text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary rounded-md theme-transition"
                >
                  {category}
                  {toolsByCategory[category]?.length > 0 && (
                    <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 ml-1 opacity-50 group-hover:opacity-100" />
                  )}
                </Link>
                {hoveredCategory === category && toolsByCategory[category]?.length > 0 && (
                  <div 
                    className="absolute top-full left-0 mt-1 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                    onMouseEnter={() => handleMenuEnter(category)}
                    onMouseLeave={handleMenuLeave}
                    style={{ 
                      minWidth: `${Math.min(getColumnCount(toolsByCategory[category]) * 180, 660)}px`
                    }}
                  >
                    <div className="grid gap-x-2 px-2" 
                         style={{ 
                           gridTemplateColumns: `repeat(${getColumnCount(toolsByCategory[category])}, 1fr)`
                         }}>
                      {splitIntoColumns(toolsByCategory[category], getColumnCount(toolsByCategory[category])).map((columnTools, columnIndex) => (
                        <div key={columnIndex} className="flex flex-col">
                          {columnTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={`/tools/${tool.id}`}
                              className="px-3 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              {tool.name || tool.title}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* About Us Menu */}
            <div className="relative group">
              <Link
                href="/about"
                className="flex items-center py-2 text-xs md:text-[13px] lg:text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary rounded-md theme-transition"
              >
                About Us
                <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 ml-1 opacity-50 group-hover:opacity-100" />
              </Link>
              <div 
                className="absolute top-full right-0 mt-1 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm min-w-[160px] md:min-w-[180px] lg:min-w-[200px] hidden group-hover:block"
              >
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary theme-transition md:hidden"
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
            className="fixed inset-0 z-50 md:hidden bg-black/60"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-900 shadow-2xl theme-transition"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="px-2 py-4 space-y-1">
                {Object.values(TOOL_CATEGORIES).map((category) => (
                  <div key={category} className="py-2">
                    <div className="flex items-center justify-between rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Link
                        href={category === 'Convert Case' ? '/' : `/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        className="flex-1 px-3 py-2 text-base font-medium text-gray-900 dark:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category}
                      </Link>
                      {toolsByCategory[category]?.length > 0 && (
                        <button
                          onClick={(e) => toggleCategory(category, e)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md"
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
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                            {toolsByCategory[category].map((tool) => (
                              <Link
                                key={tool.id}
                                href={`/tools/${tool.id}`}
                                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {tool.name || tool.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Mobile About Us Menu */}
                <div className="py-2">
                  <div className="flex items-center justify-between rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link
                      href="/about"
                      className="flex-1 px-3 py-2 text-base font-medium text-gray-900 dark:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                  </div>
                  <div className="mt-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <Link
                      href="/contact"
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

