'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon } from 'lucide-react';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Case Converter</span>
          </Link>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2.5 text-sm font-medium md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>

        <div className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-background border-b border-border/40 md:static md:block md:border-none`}>
          <nav className="flex flex-col md:flex-row md:items-center">
            <Link href="/tools" className="px-5 py-2 text-sm font-medium hover:text-primary">
              Tools
            </Link>
            <Link href="/about" className="px-5 py-2 text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="px-5 py-2 text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <span className="sr-only">Toggle theme</span>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
} 